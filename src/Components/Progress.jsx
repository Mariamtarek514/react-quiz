import React from "react";

const Progress = ({
    index,
    numQuestions,
    points,
    maxPossiblePoinst,
    answer,
}) => {
    return (
        <header className="progress">
            <progress
                max={numQuestions}
                value={index + Number(answer !== null)}
            />
            <p>
                Question <strong>{index + 1}</strong> / {numQuestions}
            </p>
            <p>
                <strong>{points}</strong>/{maxPossiblePoinst}
            </p>
        </header>
    );
};

export default Progress;
