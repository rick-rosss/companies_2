console.log(jQuery.validator);
jQuery.validator.addMethod("lettersonly", function(value, element)
{
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only");
$( document ).ready(function() {
    $('.form').validate({
        rules: {
            name: {
                required: true,
                minlength: 3,
                lettersonly: true
            },
            secondname: {
                required: true,
                minlength: 3,
                lettersonly: true
            },
            email: {
                required: true,
                email: true
            },
            pass: {
                required: true,
                minlength: 8
            },
            agree: {
                required: true
            }
        },
        messages: {
            agree: {
                required: "tick this field to continue"
            }
        },
        submitHandler: function() {
            sendAjaxForm('//codeit.ai/codeitCandidates/serverFrontendTest/user/registration');
            return false;
        }
    });
});

function sendAjaxForm(url) {
    $.ajax({
        url:     url, //url страницы (action_ajax_form.php)
        type:     "POST", //метод отправки
        dataType: "html", //формат данных
        data: $('.form').serialize(),  // Сеарилизуем объект
        success: function(response) { //Данные отправлены успешно
            result = $.parseJSON(response);
            if(result.status === "Form Error" || result.status === "Error"){
                alert(result.message);
            }
            else{
                window.location.href = "company.html";
            }
        },
        error: function(response) { // Данные не отправлены
            throw new  Error('Unknown error');
        }
    });
}
console.log(1);