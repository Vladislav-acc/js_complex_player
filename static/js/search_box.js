let availableKeywords = [
    'Beyerdynamic DT 990 Pro 250 Ω',
    'Audio-Technica ATH-M50x',
    'Beyerdynamic DT 770 Pro 250 Ω',
    'Sennheiser HD 650',
    'Beyerdynamic DT 770 Pro 80 Ω',
    'Beyerdynamic DT 1990 Pro',
    'Sony MDR-7506',
    'Beyerdynamic DT 880 Pro',
    'Sennheiser HD 600',
    'Apple AirPods Pro',
    'Beyerdynamic DT 900 Pro X',
    'Sennheiser HD 280 Pro',
    'Audio-Technica ATH-M40x',
    'Sennheiser HD 25',
    'Sennheiser HD 660 S',
    'Apple Earpods',
    'AKG K240 MKII',
    'AKG K712 Pro',
    'AKG K240 Studio',
    'Apple AirPods Pro (2nd gen)',
    'Apple AirPods' 
]; 
availableKeywords.sort()
const resultBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");

inputBox.addEventListener('keyup', (event) => {
    
    if (event.key !== 'Enter') {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
        result = availableKeywords.filter((keyword) => {
            return keyword.toLocaleLowerCase().replaceAll(' ', '').includes(input.toLowerCase().replaceAll(' ', ''));
        });
    } else {
        inputBox.setAttribute('checked', false); 
    }
    display(result);

    if (!result.length) {
        resultBox.innerHTML = '';
    }}
})

function display(result) {
    const content = result.map((list)=>{
        return "<li onclick=selectInput(this)>" + list + "</li>";
    });

    resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

selectModelEvent = new CustomEvent("selectModel");

let selectedModel;
function selectInput(list) {
    inputBox.value = list.innerHTML;
    inputBox.setAttribute('checked', true);
    resultBox.innerHTML = '';
    inputBox.focus();
    selectedModel = inputBox.value;
    inputBox.dispatchEvent(selectModelEvent);
}

const clearButton = document.querySelector('.clear-btn');
clearButton.addEventListener('click', () => {
    if (inputBox.value) {
        inputBox.value = '';
        inputBox.setAttribute('checked', false);
        display(availableKeywords)
    }
    
})

inputBox.addEventListener('click', () => {
    if (resultBox.innerHTML) {
        resultBox.innerHTML = '';   
    } else {
        display(availableKeywords);
    }
})

clearButton.prepend("\u2715")