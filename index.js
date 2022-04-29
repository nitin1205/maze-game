const { Engine, Render, Runner , World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 14;
const cellsVertical = 10;

const unitLenghtX = width / cellsHorizontal;
const unitLenghtY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);


// border
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls)

// maze structure

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// console.log("grid: ", grid);
// console.log("vertical: ", vertical);
// console.log("horizontal: ", horizontal);

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

// console.log(startRow, startCol)


const stepThroughCell = (row, column) => {
    // if cell is visited then return
    if (grid[row][column]) {
        return;
    }
    
    // if cell not visited mark visited (true)
    grid[row][column] = true;

    // randomly ordered neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],    
        [row, column + 1, 'right'],    
        [row + 1, column, 'down'],     
        [row, column - 1, 'left']     
    ]);
    
    // taking each neighbour in neighbours
    for (let neighbour of neighbours) {
        const [nextRow, nextCol, direction] = neighbour;

        // check if neighbour is out of range
        if (nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextCol < 0 ||
            nextCol >= cellsHorizontal
            ) {
            continue;
        }

        // check if neighbour is already visited
        if (grid[nextRow][nextCol]) {
            continue;
        }

        // remove wall between present column and next column
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        }else if (direction === 'up') {
            horizontals[row - 1][column] = true
        }else if (direction === 'down') {
            horizontals[row][column] = true
        }
        stepThroughCell(nextRow, nextCol);
    }
 };

stepThroughCell(startRow, startCol); 

// horizontal wall
 horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX / 2,
            rowIndex * unitLenghtY + unitLenghtY,
            unitLenghtX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
 });

 // vertical wall
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX,
            rowIndex * unitLenghtY + unitLenghtY / 2,
            5,
            unitLenghtY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'purple'
                }
            }
        );
        World.add(world, wall);
    });
});

// goal
const goal = Bodies.rectangle(
    width - unitLenghtX / 2,
    height - unitLenghtY / 2,
    unitLenghtX * .7,
    unitLenghtY * .7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLenghtX, unitLenghtY) / 4;
const ball = Bodies.circle(
    unitLenghtX / 2,
    unitLenghtY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'yellow'
        }
    }
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    
    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 5 });
    }

    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y });
    }

    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 });
    }

    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y });
    }
});

// win condition and falling animation

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const label = ['ball', 'goal']

        if (
            label.includes(collision.bodyA.label) &&
            label.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});


