const { Engine, Render, Runner , World, Bodies, Body } = Matter;

const width = 600;
const height = 600;
const cells = 10;

const unitLenght = width / cells;

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

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells -1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

// console.log("grid: ", grid);
// console.log("vertical: ", vertical);
// console.log("horizontal: ", horizontal);

const startRow = Math.floor(Math.random() * cells);
const startCol = Math.floor(Math.random() * cells);

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
        if (nextRow < 0 || nextRow >= cells || nextCol < 0 || nextCol >= cells) {
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
            columnIndex * unitLenght + unitLenght / 2,
            rowIndex * unitLenght + unitLenght,
            unitLenght,
            1,
            {
                isStatic: true
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
            columnIndex * unitLenght + unitLenght,
            rowIndex * unitLenght + unitLenght / 2,
            1,
            unitLenght,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

// goal
const goal = Bodies.rectangle(
    width - unitLenght / 2,
    height - unitLenght / 2,
    unitLenght * .7,
    unitLenght * .7,
    {
        isStatic: true
    }
);
World.add(world, goal);

// Ball
const ball = Bodies.circle(
    unitLenght / 2,
    unitLenght / 2,
    unitLenght / 2,
    unitLenght / 4
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