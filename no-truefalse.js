// Remove the true/false question type from the playable bank.
for (let i = QUESTIONS.length - 1; i >= 0; i--) {
  if (QUESTIONS[i].questionType === 'truefalse') QUESTIONS.splice(i, 1);
}
