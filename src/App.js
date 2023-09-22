import { useEffect, useReducer } from "react";
import Header from "./Components/Header";
import Main from "./Components/Main";
import Loader from "./Components/Loader";
import Error from "./Components/Error";
import StartScreen from "./Components/StartScreen";
import Question from "./Components/Question";
import NextButton from "./Components/NextButton";
import Progress from "./Components/Progress";
import FinishScreen from "./Components/FinishScreen";
import Timer from "./Components/Timer";
import Footer from "./Components/Footer";
const SECS_PER_QUESTION = 30;
const initialState = {
    questions: [],
    status: "loading",
    currentIndex: 0,
    answer: null,
    points: 0,
    highscore: 0,
    secondRemaining: null,
};
function reducer(state, action) {
    switch (action.type) {
        case "dataRecived":
            return { ...state, questions: action.payload, status: "ready" };
        case "dataFailed":
            return { ...state, status: "error" };
        case "start":
            return {
                ...state,
                status: "active",
                secondRemaining: state.questions.length * SECS_PER_QUESTION,
            };
        case "newAnswer":
            const question = state.questions.at(state.currentIndex);
            return {
                ...state,
                answer: action.payload,
                points:
                    action.payload === question.correctOption
                        ? state.points + question.points
                        : state.points,
            };
        case "nextQuestion":
            return {
                ...state,
                currentIndex: state.currentIndex + 1,
                answer: null,
            };
        case "finish":
            return {
                ...state,
                status: "finished",
                highscore:
                    state.points > state.highscore
                        ? state.points
                        : state.highscore,
            };
        case "restart":
            return {
                ...initialState,
                questions: state.questions,
                status: "ready",
                history: state.highscore,
            };
        case "tick":
            return {
                ...state,
                secondRemaining: state.secondRemaining - 1,
                status: state.secondRemaining === 0 ? "finished" : state.status,
            };
        default:
            throw new Error("Action unknown");
    }
}
function App() {
    const [
        {
            questions,
            status,
            currentIndex,
            answer,
            points,
            highscore,
            secondRemaining,
        },
        dispatch,
    ] = useReducer(reducer, initialState);
    const numQuestions = questions.length;
    const maxPossiblePoinst = questions.reduce(
        (pre, cur) => pre + cur.points,
        0
    );
    async function fetchData() {
        try {
            const response = await fetch("http://localhost:9000/questions");
            const data = await response.json();
            dispatch({ type: "dataRecived", payload: data });
        } catch (err) {
            dispatch({ type: "dataFailed" });
            console.log(err.message);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <div className="app">
            <Header />
            <Main>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && (
                    <StartScreen
                        numQuestions={numQuestions}
                        dispatch={dispatch}
                    />
                )}
                {status === "active" && (
                    <>
                        <Progress
                            index={currentIndex}
                            numQuestions={numQuestions}
                            points={points}
                            maxPossiblePoinst={maxPossiblePoinst}
                            answer={answer}
                        />
                        <Question
                            question={questions[currentIndex]}
                            dispatch={dispatch}
                            answer={answer}
                        />
                        {answer !== null && (
                            <Footer>
                                <NextButton
                                    dispatch={dispatch}
                                    index={currentIndex}
                                    numQuestions={numQuestions}
                                />
                                <Timer
                                    dispatch={dispatch}
                                    secondRemaining={secondRemaining}
                                />
                            </Footer>
                        )}
                    </>
                )}
                {status === "finished" && (
                    <FinishScreen
                        points={points}
                        maxPossiblePoints={maxPossiblePoinst}
                        highscore={highscore}
                        dispatch={dispatch}
                    />
                )}
            </Main>
        </div>
    );
}

export default App;
