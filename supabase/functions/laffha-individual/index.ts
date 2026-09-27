import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,x-client-info,content-type",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const avatars = ["😄", "😆", "😊", "🥰", "😎", "😉", "😮", "😬", "😟", "😠", "😌", "😴"];
const categories = ["tv", "movies", "songs", "artists", "cartoons", "sports", "general", "countries"];
const clean = (value: unknown, limit: number) => String(value ?? "").trim().slice(0, limit);
const randomCode = () => String(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000);
const shuffle = <T>(values: T[]) => {
  const list = [...values];
  for (let i = list.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  try {
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return reply({ error: "unauthorized" }, 401);
    const userId = auth.user.id;
    const input = await request.json();
    const action = clean(input.action, 20);
    let room: any = null;

    if (action === "create") {
      const name = clean(input.name, 24);
      const rounds = [5,8,10,15].includes(Number(input.rounds)) ? Number(input.rounds) : 8;
      if (!name) return reply({ error: "name_required" }, 400);
      for (let n = 0; n < 8; n++) {
        const { data, error } = await admin.from("individual_rooms")
          .insert({ code: randomCode(), host_user_id: userId, total_rounds: rounds }).select("*").single();
        if (error?.code === "23505") continue;
        if (error) throw error;
        room = data;
        break;
      }
      if (!room) return reply({ error: "code_unavailable" }, 503);
      const { error } = await admin.from("individual_players").insert({
        room_id: room.id, user_id: userId, display_name: name,
        avatar: avatars.includes(input.avatar) ? input.avatar : avatars[0], seat: 0,
      });
      if (error) throw error;
    } else if (action === "join") {
      const code = clean(input.code, 6);
      const name = clean(input.name, 24);
      if (!/^\d{6}$/.test(code) || !name) return reply({ error: "invalid_join" }, 400);
      const { data, error } = await admin.from("individual_rooms")
        .select("*").eq("code", code).maybeSingle();
      if (error) throw error;
      if (!data || data.phase !== "lobby") return reply({ error: "room_unavailable" }, 404);
      room = data;
      const { data: members, error: membersError } = await admin.from("individual_players")
        .select("user_id,seat").eq("room_id", room.id).order("seat");
      if (membersError) throw membersError;
      if (!members?.some((x) => x.user_id === userId)) {
        if ((members?.length || 0) >= 12) return reply({ error: "room_full" }, 409);
        const seats = new Set((members || []).map((x) => x.seat));
        let seat = 0; while (seats.has(seat)) seat++;
        const { error: insertError } = await admin.from("individual_players").insert({
          room_id: room.id, user_id: userId, display_name: name,
          avatar: avatars.includes(input.avatar) ? input.avatar : avatars[0], seat,
        });
        if (insertError) throw insertError;
      }
    } else {
      const roomId = clean(input.roomId, 36);
      const { data, error } = await admin.from("individual_rooms").select("*").eq("id", roomId).maybeSingle();
      if (error) throw error;
      if (!data) return reply({ error: "room_unavailable" }, 404);
      room = data;
      const { data: member, error: memberError } = await admin.from("individual_players")
        .select("id,seat").eq("room_id", room.id).eq("user_id", userId).maybeSingle();
      if (memberError) throw memberError;
      if (!member) return reply({ error: "not_a_player" }, 403);

      if (action === "start") {
        if (room.host_user_id !== userId || room.phase !== "lobby") return reply({ error: "forbidden" }, 403);
        const { count, error: countError } = await admin.from("individual_players")
          .select("id", { count: "exact", head: true }).eq("room_id", room.id);
        if (countError) throw countError;
        if ((count || 0) < 2) return reply({ error: "need_two_players" }, 409);
        const { error } = await admin.from("individual_rooms").update({ phase: "spin" })
          .eq("id", room.id).eq("phase", "lobby");
        if (error) throw error;
      } else if (action === "spin") {
        if (room.phase !== "spin" || member.seat !== room.turn_index) return reply({ error: "not_your_turn" }, 409);
        const randomized = [...categories].sort(() => Math.random() - .5);
        let selected: any = null;
        let category = "";
        for (const candidate of randomized) {
          const { data: questions, error } = await admin.from("question_bank")
            .select("id,category,public_payload,correct_answer").eq("active", true).eq("category", candidate).limit(1000);
          if (error) throw error;
          const pool = (questions || []).filter((q) =>
            !room.used_question_ids.includes(q.id) &&
            q.public_payload?.questionType === "mcq" &&
            Array.isArray(q.public_payload?.wrongAnswers) &&
            new Set([q.correct_answer,...q.public_payload.wrongAnswers]).size >= 4
          );
          if (pool.length) {
            selected = pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];
            category = candidate;
            break;
          }
        }
        if (!selected) return reply({ error: "no_questions" }, 409);
        const wrong = [...new Set(selected.public_payload.wrongAnswers.map(String))]
          .filter((x) => x !== String(selected.correct_answer)).slice(0, 3);
        const options = shuffle([String(selected.correct_answer), ...wrong]);
        const now = Date.now();
        const { error: updateError } = await admin.from("individual_rooms").update({
          phase: "question", category, question_id: selected.id, question_options: options,
          opened_at: new Date(now + 1800).toISOString(),
          deadline: new Date(now + 31800).toISOString(),
          used_question_ids: [...room.used_question_ids, selected.id],
        }).eq("id", room.id).eq("phase", "spin");
        if (updateError) throw updateError;
      } else if (action === "answer") {
        const answer = clean(input.answer, 160);
        if (!answer) return reply({ error: "answer_required" }, 400);
        const { data, error } = await admin.rpc("individual_submit_answer", {
          p_room_id: room.id, p_user_id: userId, p_answer: answer,
        });
        if (error) return reply({ error: error.message }, 409);
        return reply({ submission: data?.[0] || null });
      } else if (action === "next") {
        if (room.phase !== "result" || room.host_user_id !== userId) return reply({ error: "forbidden" }, 403);
        const { data: players, error: playersError } = await admin.from("individual_players")
          .select("seat").eq("room_id", room.id).order("seat");
        if (playersError) throw playersError;
        const nextRound = room.round_no + 1;
        const nextSeat = (room.turn_index + 1) % (players?.length || 1);
        const { error } = await admin.from("individual_rooms").update({
          phase: nextRound > room.total_rounds ? "finished" : "spin",
          round_no: nextRound, turn_index: nextSeat, question_id: null,
          category: null, question_options: [], opened_at: null, deadline: null,
        }).eq("id", room.id).eq("phase", "result");
        if (error) throw error;
      } else if (action !== "state") return reply({ error: "invalid_action" }, 400);
    }

    if (room.phase === "question" && room.deadline && Date.now() >= Date.parse(room.deadline)) {
      await admin.from("individual_rooms").update({ phase: "result" })
        .eq("id", room.id).eq("phase", "question");
    }
    const { data: refreshed, error: roomError } = await admin.from("individual_rooms")
      .select("*").eq("id", room.id).single();
    if (roomError) throw roomError;
    const { data: players, error: playersError } = await admin.from("individual_players")
      .select("user_id,display_name,avatar,seat,score").eq("room_id", room.id).order("seat");
    if (playersError) throw playersError;
    const { data: answers, error: answerError } = await admin.from("individual_answers")
      .select("user_id,is_correct,points").eq("room_id", room.id).eq("round_no", refreshed.round_no);
    if (answerError) throw answerError;
    let question = null;
    if (refreshed.question_id) {
      const { data: q, error: qError } = await admin.from("question_bank")
        .select("id,category,public_payload,correct_answer").eq("id", refreshed.question_id).single();
      if (qError) throw qError;
      question = {
        id: q.id, category: q.category,
        text: clean(q.public_payload?.questionText, 500),
        options: refreshed.question_options || [],
        ...(refreshed.phase === "result" ? { correctAnswer: q.correct_answer } : {}),
      };
    }
    return reply({
      room: {
        id: refreshed.id, code: refreshed.code, phase: refreshed.phase,
        round: refreshed.round_no, rounds: refreshed.total_rounds, turnIndex: refreshed.turn_index,
        openedAt: refreshed.opened_at, deadline: refreshed.deadline,
      },
      players: players || [], question,
      answeredCount: answers?.length || 0,
      ownAnswer: answers?.find((x) => x.user_id === userId) || null,
      isHost: refreshed.host_user_id === userId,
      userId,
    });
  } catch (error) {
    return reply({ error: String((error as Error)?.message || error) }, 400);
  }
});
