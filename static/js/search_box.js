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

inputBox.onkeyup = function() {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
        result = availableKeywords.filter((keyword) => {
            return keyword.toLocaleLowerCase().split(' ').join('').includes(input.toLowerCase().split(' ').join(''));
        });
        console.log(result);
    }
    display(result);

    if (!result.length) {
        resultBox.innerHTML = '';
    }
}

function display(result) {
    const content = result.map((list)=>{
        return "<li onclick=selectInput(this)>" + list + "</li>";
    });

    resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
    inputBox.value = list.innerHTML;
    resultBox.innerHTML = '';
}

const listButton = document.querySelector('.listBtn');
listButton.addEventListener('click', () => {
    // if (resultBox.innerHTML) {
    //     resultBox.innerHTML = '';    
    // } else {
    //     display(availableKeywords);
    // }
    if (inputBox.value) {
        inputBox.value = '';
        display(availableKeywords)
    }
    
})

inputBox.addEventListener('click', () => {
    console.log(resultBox.innerHTML)
    if (resultBox.innerHTML) {
        resultBox.innerHTML = '';    
    } else {
        display(availableKeywords);
    }
})

// console.log(String.fromCodePoint(parseInt('f00d', 16)))
listButton.prepend("\u2715")