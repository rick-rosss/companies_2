"use strict";
let companies = []; // массивы для хранения данных
let news = [];
let currentPartners = [];
let newsIndex = 0; // переменная хранящая номер текущей новости
let lastSort = sortListDefault; // запоминае последнюю сортировку
function getData(url, className, bool) { // функция получения данных, bool - показывает, какие данные будут получены.
    $.ajax({
        url:     url,
        type:     "POST",
        dataType: "html",
        success: function(response) {
            $('.preloader').hide();
            let result = $.parseJSON(response);
            if(bool){
                companies = result;
                getCountries();
                $('.cont__text').html(companies.list.length);
                addCompToHtml(companies.list, className);
            }
            else {
                news = result;
                addNewsToHtml();
            }
        },
        error: function(response) { // Данные не отправлены
            $('.preloader').hide();
            throw new  Error('Unknown error');
        }
    });
}
function getCompanies() {
    getData('//codeit.ai/codeitCandidates/serverFrontendTest/company/getList', '.cont__list', true);

}
function addCompToHtml(comp, className){ // добавляет список компаний на страницу
    $(className).empty();
    for (let i of comp) {
        let newDiv = document.createElement('div');
        let newP = document.createElement('p');
        newDiv.classList.add('list__item');
        newDiv.id = i.name;
        newP.classList.add('list__text');
        newP.innerHTML = i.name;
        newDiv.append(newP);
        newDiv.addEventListener('click', partners);
        $(className).append(newDiv);
    }
}
function partners(e){ // определяет партнеров
    for(let i of companies.list){
        if(i.name === e.target.closest('.list__item').id) {
            currentPartners = i.partners;
            break;
        }
    }
    lastSort();
}
// функции сортировки
$('.percent_arrow_down').on('click', sortListDefault);
function sortListDefault() {
    if(currentPartners) {
        currentPartners.sort(function (a, b) {
            return b.value - a.value;
        });
        addPartnToHtml(partners);
    }
    lastSort = sortListDefault;
}
$('.percent_arrow_up').on('click', sortListPercentUp);
function sortListPercentUp(){
    if(currentPartners) {
        currentPartners.sort(function (a, b) {
            return a.value - b.value;
        });
        addPartnToHtml(partners);
        lastSort = sortListPercentUp;
    }
}
$('.name_arrow_down').on('click', sortListNameDown);
function sortListNameDown() {
    if(currentPartners) {
        currentPartners.sort(function (a, b) {
            let nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0
        });
        addPartnToHtml();
        lastSort = sortListNameDown;
    }
}
$('.name_arrow_up').on('click', sortListNameUp);
function sortListNameUp() {
    if(currentPartners) {
        currentPartners.sort(function (a, b) {
            let nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
            if (nameA < nameB)
                return 1;
            if (nameA > nameB)
                return -1;
            return 0
        });
        addPartnToHtml();
        lastSort = sortListNameUp;
    }
}
function addPartnToHtml(){  // добавляет список партнеров на страницу
    $('.cont__partn_inf').empty();
    for (let i of currentPartners) {
        let listItem = document.createElement('div');
        let newP = document.createElement('p');
        let circle = document.createElement('div');
        listItem.classList.add('list_p');
        newP.classList.add('list_p__text');
        circle.classList.add('list_p__circle');
        newP.innerHTML = i.name;
        circle.innerHTML = i.value + '%';
        listItem.append(circle);
        listItem.append(newP);
        $('.cont__partn_inf').append(listItem);
        $('.cont__partn').show();
    }
}
function getNews(){
    getData('//codeit.ai/codeitCandidates/serverFrontendTest/news/getList', addNewsToHtml, false);
}
function addNewsToHtml(){ // добавляет текущую новость на страницу
    $('.cont__news_img').attr('src', deleteProtocol(news.list[newsIndex].img));
    $('.cont__news_text').html(news.list[newsIndex].description);
    $('.news_author_name').html(news.list[newsIndex].author);
    $('.news_date_value').html(getCorrectDate(news.list[newsIndex].date));
    ellipsis();
}
 function getCorrectDate(date){ // преобразует дату
     let dateString = '';
     let newDate = new Date(Number(date) * 1000);
     dateString += newDate.getFullYear() + '.';
     dateString += addZero(newDate.getMonth() + 1) + '.';
     dateString += addZero(newDate.getDate());
     return dateString;
}
function addZero(number){ // добавляет 0 к дате
     if(number < 10)
         number = '0' + number;
     return number;
}
function deleteProtocol(string){
     return string.split(':')[1];
}
function ellipsis() { // при необходимости добавляет троеточие
    if($('.cont__news').innerHeight() < $('.cont__news_text').innerHeight())
        $('.cont__news_ell').show();
    else
        $('.cont__news_ell').hide();
}
function nextNews() {
    newsIndex ++;
    if (newsIndex >= news.list.length)
        newsIndex = 0;
    addNewsToHtml();
}
function prevNews() {
    newsIndex --;
    if (newsIndex <= 0)
        newsIndex = news.list.length - 1;
    addNewsToHtml();
}
$('#prev_news').on('click', prevNews);
$('#next_news').on('click', nextNews);
let countries = [];
let isAdd = false; // флаг, наличия страны в массиве countries
function getCountries() { // получает список компаний по странам
    for (let i of companies.list) {
        for (let j = 0; j < countries.length; j++) {
            if (countries[j].code === i.location.code) {
                countries[j].count += 1;
                isAdd = true;
                break;
            }
        }
        if (!isAdd) {
            countries.push({
                name: i.location.name,
                code: i.location.code,
                count: 1
            })
        }
    }
    getPercentage();
    getNames();
    draw();
}
let percentage = [];
let names = [];
function getPercentage(){
    for(let i of countries){
        percentage.push(i.count / companies.list.length * 100)
    }
}
function getNames(){
    for(let i of countries){
        names.push(i.name);
    }
}
let pieChart;
function draw(){ // рисует диаграмму
    let canvas = document.getElementById("chart");
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 14;
    let chartData = {
        labels: names,
        datasets: [
            {
                data: percentage,
                backgroundColor: [
                    "#DDD",
                    "#AAA",
                    "#CCC",
                    "#999",
                    "#EEE"
                ]
            }]
    };

     pieChart = new Chart(canvas, {
        type: 'pie',
        data: chartData,
    });
}
$('#chart').on('click', getCompByLocation);
function getCompByLocation(evt){ // получает компании по стране
    console.log(1);
    let comp = [];
    let activePoints = pieChart.getElementsAtEvent(evt);
    let country = names[activePoints[0]._index];
    for(let i of companies.list){
        if(i.location.name === country)
            comp.push(i);
    }
    addCompToHtml(comp, '.cont__list_loc');
    $('.cont__canvas').hide();
    $('.cont__list_loc').show();
    $('.cont__btn-back').show();
}
$('.cont__btn-back').on('click', back);
function back() {
    $('.cont__list_loc').hide();
    $('.cont__btn-back').hide();
    $('.cont__canvas').show();
}