// Constants
const TROOPS = ['spear', 'sword', 'axe', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
const DENOMINATOR_KEY = 'troopDenominator';
const SCREEN = "place";

// Utility functions
const getLSKey = (troop) => `rallyDivider${troop}`;
const getDenominator = () => parseInt(localStorage.getItem(DENOMINATOR_KEY)) || 2;
const setDenominator = (value) => localStorage.setItem(DENOMINATOR_KEY, value);

// CSS Styles
const addStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .checkbox-margin {
            margin-right: 10px;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
};

// Troop Map initialization
const initTroopsMap = () => {
    const troopsMap = new Map();
    TROOPS.forEach(troop => {
        const lsValue = localStorage.getItem(getLSKey(troop));
        troopsMap.set(troop, {enabled: lsValue === null ? true : lsValue === 'true'});
    });
    return troopsMap;
};

// UI Elements creation
const createCheckbox = (troop, troopsMap) => {
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = `${troop}-checkbox`;
    checkBox.checked = troopsMap.get(troop).enabled;
    checkBox.classList.add('checkbox-margin');

    checkBox.addEventListener('change', () => {
        localStorage.setItem(getLSKey(troop), checkBox.checked);
        troopsMap.set(troop, {enabled: checkBox.checked});
        console.log(`${troop} Checkbox is ${checkBox.checked ? 'checked' : 'unchecked'}`);
        console.log(troopsMap);
    });

    return checkBox;
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

const createNumberInput = () => {
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.value = getDenominator();
    numberInput.style.width = '50px';
    numberInput.addEventListener('change', () => {
        setDenominator(numberInput.value);
        console.log(`Denominator set to ${numberInput.value}`);
    });
    return numberInput;
};

const createDivideButton = (numberInput, troopsMap) => {
    const divideButton = document.createElement('button');
    divideButton.textContent = 'Divide';
    divideButton.classList.add('btn');
    divideButton.style.marginLeft = '10px';
    divideButton.addEventListener('click', () => divideTroops(numberInput.value, troopsMap));
    return divideButton;
};

// Main functions
const divideTroops = (denominator, troopsMap) => {
    console.log(`Divide button clicked. Denominator: ${denominator}`);
    troopsMap.forEach((value, key) => {
        if (value.enabled) {
            const unit = document.querySelector(`#unit_input_${key}`);
            if (unit && unit.value !== '') {
                const number = parseInt(unit.value);
                if (number && number > 0) {
                    unit.value = Math.floor(number / denominator);
                }
            }
        }
    });
};

const prepareUI = () => {
    const troopsMap = initTroopsMap();
    const newDiv = document.createElement('div');
    newDiv.innerHTML = '<h3>Troops Divider:</h3>';
    newDiv.id = 'divider';

    TROOPS.forEach(troop => {
        newDiv.appendChild(createTroopLink(troop));
        newDiv.appendChild(createCheckbox(troop, troopsMap));
    });

    const numberInput = createNumberInput();
    const divideButton = createDivideButton(numberInput, troopsMap);

    newDiv.appendChild(numberInput);
    newDiv.appendChild(divideButton);

    const formElement = document.getElementById('command-data-form');
    formElement.parentNode.insertBefore(newDiv, formElement);
};

// Main execution
const main = () => {
    addStyles();
    if (game_data.mode !== null || game_data.screen !== SCREEN) {
        window.location.assign(game_data.link_base_pure + SCREEN);
    } else {
        prepareUI();
    }
};

main();