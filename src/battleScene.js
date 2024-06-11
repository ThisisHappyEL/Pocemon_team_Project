/* eslint-disable import/no-cycle */
/* eslint-disable no-undef */

import { Sprite, Monster } from './classes.js';
import attacks from './attacks.js';
import { allMonsters, playerMonsters } from './monsters.js';
import { animate, battle } from './mainScene.js';
import audio from './audio.js';

const canvas = document.querySelector('canvas'); // вырисовываемый блок
const context = canvas.getContext('2d'); // контекст

const battleBackGroundImage = new Image(); // загрузка задника для арены
battleBackGroundImage.src = './assets/Images/battleBackground.png';
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackGroundImage,
});

const enemyMonsterPosition = {
  x: 1330,
  y: 100,
};

const playerMonsterPosition = {
  x: 450,
  y: 450,
};

// множество параметров, которые необходимо заполнить при инициации боя
let enemyMonster;
let playerMonster;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {
  document.querySelector('#chooseMonstersPanel').style.display = 'block';
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#chooseMonstersBox').replaceChildren();
  document.querySelector('#attacksBox').replaceChildren();

  enemyMonster = new Monster({
    ...allMonsters.JabbaScript,
    position: enemyMonsterPosition,
    isEnemy: true,
  });
  renderedSprites = [enemyMonster];
  document.querySelector('#enemyMonsterName').innerText = `Enemy ${enemyMonster.name}`;

  queue = [];

  playerMonsters.forEach((name) => {
    const pickMonsterButton = document.createElement('button');
    pickMonsterButton.id = 'chooseMonsterButton';
    pickMonsterButton.classList.add('monster-container');
    pickMonsterButton.setAttribute('data-name', name);

    const buttonContentContainer = document.createElement('div');
    buttonContentContainer.style.display = 'flex';
    buttonContentContainer.style.alignItems = 'center';

    const canvasAnimationSprite = document.createElement('canvas');
    canvasAnimationSprite.id = 'monsterAnimBox';
    canvasAnimationSprite.width = 200;
    canvasAnimationSprite.height = 175;

    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');

    const monsterAttacks = allMonsters[name].attacks;
    monsterAttacks.forEach((attack) => {
      const attackIconSrc = attack.typeIcon.src;
      const attackIcon = document.createElement('img');
      attackIcon.src = attackIconSrc;
      attackIcon.classList.add('attack-icon');
      iconContainer.append(attackIcon);
    });

    const localContext = canvasAnimationSprite.getContext('2d');

    const monster = new Monster({
      position: {
        x: 0,
        y: 0,
      },
      image: { src: allMonsters[name].image.src },
      frames: allMonsters[name].frames,
      context: localContext,
      animate: true,
      name,
      attacks: monsterAttacks,
      flip: allMonsters[name].flip,
    });

    function animatePickMonsterSprite() {
      localContext.clearRect(
        0,
        0,
        canvasAnimationSprite.width,
        canvasAnimationSprite.height,
      );
      monster.draw(localContext);
      requestAnimationFrame(animatePickMonsterSprite);
    }
    animatePickMonsterSprite();

    buttonContentContainer.append(canvasAnimationSprite);
    buttonContentContainer.append(iconContainer);

    const buttonText = document.createElement('span');
    buttonText.classList.add('buttonText');
    buttonText.innerHTML = allMonsters[name].name;

    pickMonsterButton.append(buttonContentContainer);
    pickMonsterButton.append(buttonText);

    document.querySelector('#chooseMonstersBox').append(pickMonsterButton);
  });

  document.querySelectorAll('#chooseMonstersBox button').forEach((selectMonsterButton) => {
    selectMonsterButton.addEventListener('click', (selectMonsterEvent) => {
      const selectedMonsterName = selectMonsterEvent.currentTarget.getAttribute('data-name');
      document.querySelector('#chooseMonstersPanel').style.display = 'none';

      playerMonster = new Monster({
        ...allMonsters[selectedMonsterName],
        position: playerMonsterPosition,
      });
      renderedSprites.push(playerMonster);

      document.querySelector('#playerMonsterName').innerText = `Player ${playerMonster.name}`;

      // Очистка и заполнение панели атак для выбранного монстра игрока
      document.querySelector('#attacksBox').replaceChildren();
      playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#attacksBox').append(button);

        // Добавление обработчиков событий для атак
        button.addEventListener('click', (selectAttackEvent) => {
          const selectedAttack = attacks[selectAttackEvent.currentTarget.innerHTML];
          playerMonster.attack({
            attack: selectedAttack,
            recipient: enemyMonster,
            renderedSprites,
          });

          if (enemyMonster.health <= 0) {
            queue.push(() => {
              enemyMonster.faint();
              audio.victory.play();
            });
            queue.push(() => {
              gsap.to('#overlappingDiv', {
                opacity: 1,
                onComplete: () => {
                  cancelAnimationFrame(battleAnimationId);
                  animate();
                  document.querySelector('#userInterface').style.display = 'none';
                  gsap.to('#overlappingDiv', {
                    opacity: 0,
                  });

                  battle.initiated = false;

                  if (!playerMonsters.includes(enemyMonster.name)) {
                    playerMonsters.push(enemyMonster.name);
                  }

                  audio.map.play();
                },
              });
            });
          }

          const randomAttack = enemyMonster.attacks[
            Math.floor(Math.random() * enemyMonster.attacks.length)
          ];

          queue.push(() => {
            enemyMonster.attack({
              attack: randomAttack,
              recipient: playerMonster,
              renderedSprites,
            });

            if (playerMonster.health <= 0) {
              queue.push(() => {
                playerMonster.faint();
                audio.victory.play(); // СДЕЛАТЬ ПРОИГРЫШНУЮ КОГДА ОНА БУДЕТ ГОТОВА
              });

              queue.push(() => {
                gsap.to('#overlappingDiv', {
                  opacity: 1,
                  onComplete: () => {
                    cancelAnimationFrame(battleAnimationId);
                    animate();
                    document.querySelector('#userInterface').style.display = 'none';
                    gsap.to('#overlappingDiv', {
                      opacity: 0,
                    });

                    battle.initiated = false;
                    audio.map.play();
                  },
                });
              });
            }
          });
        });
        button.addEventListener('mouseenter', (mouseenterEvent) => {
          const selectedAttack = attacks[mouseenterEvent.currentTarget.innerHTML];
          document.querySelector('#attackType').innerHTML = selectedAttack.type;
          document.querySelector('#attackType').style.color = selectedAttack.color;
        });
      });
    });
  });
}

// непосредственно функция отрисовки и работы битвы
function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw(context);

  renderedSprites.forEach((sprite) => {
    sprite.draw(context);
  });
}

// Отменить комментарий, при необходимости быстрой отладки боёв
// initBattle();
// animateBattle();

// логика для срабатывания клика по сообщению после атаки
document.querySelector('#dialogueBox').addEventListener('click', (event) => {
  const dialogueBox = event.currentTarget;

  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    dialogueBox.style.display = 'none';
  }
});

export { animateBattle, initBattle };
