import {GameConfig} from "./config";

export function updateScore(score: number, noAnimation = false) {
  const scoreElement = document.querySelector("#score")!
  noAnimation || scoreElement.classList.add('collected')
  scoreElement.innerHTML = `${score}`
}

export function linkFunctionality() {
    const score = document.querySelector("#score") as HTMLElement
    score.onanimationend = () => {
        score.classList.remove("collected")
        console.log('animation ended')
    }
}

export default (props: GameConfig['page']) => `
<!DOCTYPE html>
<html>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300&family=Roboto&display=swap" rel="stylesheet">
        <title>${props.htmlTitle}</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                font-family: 'Roboto', sans-serif;
                overflow: hidden;
            }
            html {background: #242525;color: #fff;}
            h1, h2, h3 {font-family: 'Quicksand', sans-serif;font-weight: 300;}
            h1 {font-size: 3.5rem;color: #009688;margin: 1.5rem 0;}
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            canvas {
                object-fit: contain;
                display: block;
                width: 100%;
                height: calc(100% - 3.5rem - 7rem - 7rem);
                margin-bottom: 2rem;
            }
            canvas.dead {
                animation: shake-canvas .1s linear 2, death-canvas 1s;
            }
            .flex {flex: 1}
            .flex-2 {flex: 2}
            #score {
                margin: 0;
                padding: .25em 0.5em;
                background: #2e7d32;
                border-radius: 5px;
                opacity: .2;
                transition: opacity .25s;
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            #score.collected {
                animation: opacity-in 1s;
            }
            #score:hover {
                opacity: .8;
            }
            #score:before {
                content: "Score: ";
            }
            * {box-sizing: border-box;}
            @keyframes opacity-in {
                0 {opacity: .2;}
                35% {opacity: 1; transform: scale(1.1);}
                100% {opacity: .2;}
            }
            @keyframes death-canvas {
                0% {}
                5% {background: #f4433669;}
                100% {}
            }
            @keyframes shake-canvas {
                0% {transform: translate(0, 0);}
                25% {transform: translate(.25rem, 0);}
                50% {transform: translate(0, .25rem);}
                75% {transform: translate(-.25rem, 0);}
                100% {transform: translate(0, 0);}
            }
        </style>
    </head>
    <body>
        <aside class="flex-2"></aside>
        <h1>${props.title}</h1>
        <aside class="flex"></aside>
        <h3 id="score">0</h3>
        <canvas></canvas>
    </body>
`