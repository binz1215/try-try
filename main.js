import { Bodies, Body, Engine, Render, Runner, World, Events } from 'matter-js';
import { FRUITS } from './fruits';
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false, //기본값이 트루라서 꺼야지 원하는 색이 나옴.
    background: '#f7f4c8',
    width: 620,
    height: 850,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true, // 물리엔진 적용 안되도록 고정
  render: { fillStyle: '#e6b143' },
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: '#e6b143' },
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: '#e6b143' },
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: 'topLine',
  isStatic: true,
  isSensor: true, // 부딪히지 않고 감지만 한다.
  render: { fillStyle: '#e6b143' },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null; // 부드럽게 움직이기
let num_suika = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, // 준비중 상태로 만듦
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.2, // 탄성(0~1). 크기가 커질수록 탄성이 커짐.
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

//과일 내려오기

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }
  switch (event.code) {
    case 'KeyA':
      if (interval) return;

      interval = setInterval(() => {
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
        });
        if (currentBody.position.x - currentFruit.radius < 30) {
          Body.setPosition(currentBody, { x: 590 - currentFruit.radius, y: currentBody.position.y });
        }
      }, 5);

      break;

    case 'KeyD':
      if (interval) return;

      interval = setInterval(() => {
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
        if (currentBody.position.x + currentFruit.radius > 590) {
          Body.setPosition(currentBody, { x: 30 + currentFruit.radius, y: currentBody.position.y });
        }
      }, 5);

      break;

    case 'KeyS':
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000); //1초 뒤에 과일 떨어지게

      break;
  }
};

window.onkeyup = (event) => {
  switch (event.code) {
    case 'KeyA':
    case 'KeyD':
      clearInterval(interval);
      interval = null;
  }
};

//충돌판정
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      // 각 페어의 각각을 bodyA, bodyB라고 부름.
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x, // 충돌지점의 x좌표
        collision.collision.supports[0].y, // 충돌지점의 y좌표
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
          index: index + 1,
        }
      );
      World.add(world, newBody);

      if (newBody.index === 10) {
        num_suika += 1;
      }
    }
    //패배조건
    if ((!disableAction && collision.bodyA.name === 'topLine') || collision.bodyB.name === 'topLine') {
      alert('Game over');
      const bodiesToRemove = world.bodies.filter(
        (body) => body !== leftWall && body !== rightWall && body !== ground && body !== topLine
      );
      World.remove(world, bodiesToRemove);
    }

    if (num_suika == 2) {
      setTimeout(() => {
        alert('Congratulations! You make TWO BIG beautiful "suika"!!!!');
        const bodiesToRemove = world.bodies.filter(
          (body) => body !== leftWall && body !== rightWall && body !== ground && body !== topLine
        );
        World.remove(world, bodiesToRemove);
      }, 1500);
    }
  });
});

addFruit();
