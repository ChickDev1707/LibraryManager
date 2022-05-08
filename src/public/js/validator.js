function Validator(options) {

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

        var rules = selectorRules[rule.selector]

        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormvalid = true;

            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid){
                    isFormvalid = false;
                }
            })

            if(isFormvalid){
                if(typeof options.onSubmit == 'function'){
                    var enableInput = formElement.querySelectorAll('[name]')

                    var formValue = Array.from(enableInput).reduce(function(value, input){
                        value[input.name] = input.value
                        return value
                    },{});

                    options.onSubmit(formValue)
                } else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(rule => {

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)

            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
    }
}

Validator.isRequire = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.maxLength = function (selector, max, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length <= max ? undefined : message || `Vui lòng nhập tối thiểu ${max} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfrimValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfrimValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}

Validator.isNumber = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^-?\d+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là kiểu số'
        }
    }
}