export const shuffleQuestions = (questions) => {
    questions.sort(() => Math.random() - 0.5);
    let reorderShuffleQuestions = [];

    for (let i = 0; i < questions.length; i++) {
        reorderShuffleQuestions.push(questions[i]);
        reorderShuffleQuestions[i].order = i + 1;
    }

    return reorderShuffleQuestions;
};
