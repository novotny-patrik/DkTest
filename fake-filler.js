// Constants
const TROOPS = new Map([
    ['spear', 1],
    ['sword', 1],
    ['axe', 1],
    ['spy', 2],
    ['light', 4],
    ['heavy', 6],
    ['ram', 5],
    ['catapult', 8],
    ['knight', 10],
    ['snob', 100]
]);
const SCREEN = "place";
const RATIO = 'ratio';
const KEEP = 'keep';
const MIN = 'min';
const INPUT_TYPES = [RATIO, KEEP, MIN];

function getOnePercentAndRoundUp(number) {
    const onePercent = number * 0.01;
    return Math.ceil(onePercent);
}

const MIN_POPULATION = getOnePercentAndRoundUp(game_data.village.points);

// Utility functions
const getLSKey = (troop, type) => `troopFiller_${type}_${troop}`;

const extractNumberFromText = (text) => {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

// CSS Styles
const addStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .number-input-margin {
            margin-right: 10px;
            margin-bottom: 5px;
            width: 39px;
        }
        .fill-button {
            margin-left: 10px;
        }
        .troop-row {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .row-label {
            width: 50px;
            margin-right: 10px;
            text-align: right;
            font-weight: bold;
        }
        .filled-pop {
            margin-left: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        .button-container {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }
        .img-attck{
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);
};

// UI Elements creation
const createNumberInput = (troop, type) => {
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.id = `${troop}-${type}-input`;
    numberInput.value = localStorage.getItem(getLSKey(troop, type)) || '';
    numberInput.min = 0;
    numberInput.placeholder = '0';
    numberInput.classList.add('number-input-margin');

    numberInput.addEventListener('change', () => {
        const newValue = Math.max(0, parseInt(numberInput.value) || 0);
        numberInput.value = newValue === 0 ? '' : newValue;
        localStorage.setItem(getLSKey(troop, type), numberInput.value);
        fillTroops();
    });

    return numberInput;
};

const createTroopLink = (troop) => {
    const link = document.createElement('a');
    link.className = "unit_link";
    link.dataset.unit = troop;

    const img = document.createElement('img');
    img.src = `https://dscs.innogamescdn.com/asset/35e971b9/graphic/unit/unit_${troop}.png`;
    img.className = "";
    img.dataset.title = "";

    link.appendChild(img);
    return link;
};

const createFillButton = () => {
    const button = document.createElement('button');
    button.textContent = 'Fill Troops';
    button.classList.add('btn', 'fill-button');
    button.addEventListener('click', fillTroops);
    return button;
};

const fillTroops = () => {
    const ratios = new Map();
    // Calculate ratios
    TROOPS.forEach((population, troop) => {
        const input = document.getElementById(`${troop}-ratio-input`);
        const ratio = parseInt(input.value) || 0;
        if (ratio > 0) {
            ratios.set(troop, ratio);
        }
    });

    let filledPop = 0;
    // Key troop; Value count
    let result = new Map();
    // Init
    TROOPS.forEach((population, troop) => {
        let availableTroops = extractNumberFromText(document.querySelector(`#units_entry_all_${troop}`).textContent);
        let keep = parseInt(localStorage.getItem(getLSKey(troop, KEEP))) || 0;
        let min = parseInt(localStorage.getItem(getLSKey(troop, MIN))) || 0;
        if (keep >= 0) availableTroops = availableTroops - keep;
        if (min > 0) {
            let value = Math.min(min, availableTroops);
            filledPop = filledPop + (population * value);
            result.set(troop, value);
        } else {
            result.set(troop, 0);
        }

    });


    let doneAdding = filledPop >= MIN_POPULATION;
    // Add another troops
    while (!doneAdding) {
        TROOPS.forEach((population, troop) => {
            if (ratios.has(troop) && !doneAdding) {
                for (let i = 0; i < ratios.get(troop); i++) {
                    let troopCount = 1;
                    let currentCount = result.get(troop) + troopCount;
                    let availableTroops = extractNumberFromText(document.querySelector(`#units_entry_all_${troop}`).textContent);
                    let keep = parseInt(localStorage.getItem(getLSKey(troop, KEEP))) || 0;
                    if (keep >= 0) availableTroops = availableTroops - keep;
                    if (currentCount <= availableTroops && !doneAdding) {
                        result.set(troop, currentCount);
                        filledPop = filledPop + (troopCount * population);
                    }
                    if (filledPop >= MIN_POPULATION) doneAdding = true;
                }
            }
        });
    }

    let tooMuchPop = filledPop - MIN_POPULATION;
    let doneRemoving = tooMuchPop <= 0;
    // Remove some if too much
    for (let i = 0; i < 10 && !doneRemoving; i++) {

        result.forEach((troopCount, troop, map) => {
            if (ratios.has(troop) && !doneRemoving) {
                let population = TROOPS.get(troop);
                let min = parseInt(localStorage.getItem(getLSKey(troop, MIN))) || 0;
                let removableCount = troopCount - min;
                let removablePop = removableCount * population;
                // If is possible to remove, then remove
                if (population <= tooMuchPop && removableCount > 0) {
                    map.set(troop, troopCount - 1);
                    filledPop = filledPop - population;
                    tooMuchPop = tooMuchPop - population;
                    if (MIN_POPULATION === filledPop) doneRemoving = true;
                }
            }
        })
    }


    let filledTroops = 0;
    // Fill troop inputs
    result.forEach((count, troop) => {
        const inputField = document.querySelector(`#unit_input_${troop}`);
        inputField.value = count;
        filledTroops = filledTroops + count;
    });

    // Update filled population display
    const filledPopSpan = document.getElementById('filled-pop');
    filledPopSpan.textContent = `Fake limit ${MIN_POPULATION}. Filled population: ${filledPop}. Filled troops ${filledTroops}.`;

    let attackSize = 'small';
    if (filledTroops > 1000) attackSize = 'medium';
    if (filledTroops > 5000) attackSize = 'large';
    const img = document.createElement('img');
    img.src = `https://dscs.innogamescdn.com/asset/35e971b9/graphic/command/attack_${attackSize}.png`;
    img.alt = '';
    img.className = 'img-attck';
    filledPopSpan.appendChild(img);


};

// Main functions
const prepareUI = () => {
    const newDiv = document.createElement('div');
    newDiv.innerHTML = '<h3>Troops Filler:</h3>';
    newDiv.id = 'troop-filler';

    INPUT_TYPES.forEach(type => {
        const row = document.createElement('div');
        row.classList.add('troop-row');

        const label = document.createElement('span');
        label.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ':';
        label.classList.add('row-label');
        row.appendChild(label);

        TROOPS.forEach((_, troop) => {
            row.appendChild(createTroopLink(troop));
            row.appendChild(createNumberInput(troop, type));
        });

        newDiv.appendChild(row);
    });

    //newDiv.appendChild(createFillButton());

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(createFillButton());

    // Add filled population span
    const filledPopSpan = document.createElement('span');
    filledPopSpan.id = 'filled-pop';
    filledPopSpan.classList.add('filled-pop');
    buttonContainer.appendChild(filledPopSpan);

    newDiv.appendChild(buttonContainer);

    const formElement = document.getElementById('command-data-form');
    formElement.parentNode.insertBefore(newDiv, formElement);
};

// Main execution
const main = () => {
    if (game_data.mode !== null || game_data.screen !== SCREEN) {
        window.location.assign(game_data.link_base_pure + SCREEN);
    } else {
        addStyles();
        prepareUI();
        fillTroops();
    }
};

main();
