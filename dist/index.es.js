import { Component, createElement } from 'react';
import { findDOMNode } from 'react-dom';
import { Subscription as Subscription$1 } from 'rxjs/Subscription';
import autobind from 'autobind-decorator';
import { Observable as Observable$1 } from 'rxjs/Observable';
import { BehaviorSubject as BehaviorSubject$1 } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import { Subject as Subject$1 } from 'rxjs/Subject';

const __assign = Object.assign || function (target) {
    for (var source, i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (var prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var RxFormError;
(function (RxFormError) {
    RxFormError["TYPE"] = "must be of type";
    RxFormError["FIELD"] = "You forgot some fields definitions: ";
    RxFormError["INPUT"] = "You forgot some name attribute on input tag: ";
    RxFormError["FORM"] = "There is not form tag in the decorated component";
})(RxFormError || (RxFormError = {}));

var createInputObservable = function (_a) {
    var elements = _a.elements, types = _a.types, _b = _a.event, event = _b === void 0 ? 'change' : _b;
    return Observable$1.merge.apply(Observable$1, elements
        .filter(function (element) { return types.indexOf(element.type) !== -1; })
        .map(function (element) { return Observable$1.fromEvent(element, event); }));
};
var createSelectObservable = function (_a) {
    var elements = _a.elements, _b = _a.event, event = _b === void 0 ? 'change' : _b;
    return Observable$1.merge.apply(Observable$1, elements.map(function (element) { return Observable$1.fromEvent(element, event); }));
};
var createFormObservable = function (_a) {
    var element = _a.element, _b = _a.event, event = _b === void 0 ? 'submit' : _b;
    return Observable$1.fromEvent(element, event);
};

var InputObservable = (function (_super) {
    __extends(InputObservable, _super);
    function InputObservable(_a) {
        var _b = _a.inputElements, inputElements = _b === void 0 ? [] : _b, _c = _a.selectElements, selectElements = _c === void 0 ? [] : _c, _d = _a.fields, fields = _d === void 0 ? {} : _d, _e = _a.initialValue, initialValue = _e === void 0 ? {} : _e, _f = _a.checkboxEvent, checkboxEvent = _f === void 0 ? 'change' : _f, _g = _a.textEvent, textEvent = _g === void 0 ? 'input' : _g, _h = _a.radioEvent, radioEvent = _h === void 0 ? 'change' : _h, _j = _a.selectEvent, selectEvent = _j === void 0 ? 'change' : _j, props = _a.props;
        var _this = _super.call(this, initialValue) || this;
        _this.subscriptions = [];
        _this.inputElements = [];
        _this.checkboxEvent = checkboxEvent;
        _this.textEvent = textEvent;
        _this.radioEvent = radioEvent;
        _this.selectEvent = selectEvent;
        _this.fields = fields;
        _this.props = props;
        if (inputElements.length > 0 || selectElements.length > 0) {
            _this.addInputs(inputElements, selectElements);
        }
        return _this;
    }
    InputObservable.prototype.unsubscribe = function () {
        _super.prototype.unsubscribe.call(this);
        this.subscriptions.forEach(function (subscription) {
            subscription.unsubscribe();
        });
    };
    InputObservable.prototype.formatState = function (state) {
        return Object.keys(this.fields).reduce(function (acc, fieldName) {
            return (__assign({}, acc, (_a = {}, _a[fieldName] = state[fieldName].value, _a)));
            var _a;
        }, {});
    };
    InputObservable.prototype.reduceField = function (fieldName, value, type, dirty, touched) {
        if (dirty === void 0) { dirty = true; }
        if (touched === void 0) { touched = true; }
        var formattedValue;
        switch (type) {
            case 'date':
                formattedValue = new Date(value);
                break;
            case 'range':
            case 'number':
                formattedValue = parseInt(value, 10);
                break;
            default:
                formattedValue = value;
        }
        return _a = {}, _a[fieldName] = {
                dirty: dirty,
                touched: touched,
                value: formattedValue,
            }, _a;
        var _a;
    };
    InputObservable.prototype.setValue = function (formValue) {
        Observable$1.of(this.handleBeforeValidation(formValue))
            .switchMap(this.handleError)
            .subscribe(this.next.bind(this));
    };
    InputObservable.prototype.standardInputFormatter = function (event) {
        return this.reduceField(event.target.name, event.target.value, event.target.type);
    };
    InputObservable.prototype.checkboxInputFormatter = function (event) {
        return this.reduceField(event.target.name, !!event.target.checked, event.target.type);
    };
    InputObservable.prototype.handleSubscribe = function (formValues) {
        this.next(__assign({}, this.getValue(), formValues));
    };
    InputObservable.prototype.handleError = function (formValue) {
        var _this = this;
        var inputName = Object.keys(formValue)[0];
        var field = this.fields[inputName];
        var state = this.getValue();
        if (typeof field.validation === 'function') {
            return Observable$1.of(__assign({}, state, (_a = {}, _a[inputName] = __assign({}, formValue[inputName], { error: field.validation(formValue[inputName].value, this.formatState(state), this.props) }), _a)));
        }
        else if (typeof field.validation$ === 'function') {
            this.next(__assign({}, state, (_b = {}, _b[inputName] = __assign({}, state[inputName], { pending: true }), _b)));
            return field
                .validation$(formValue[inputName].value, this.formatState(state), this.props)
                .map(function (error) {
                return (__assign({}, state, (_a = {}, _a[inputName] = __assign({}, formValue[inputName], { error: error }), _a)));
                var _a;
            })
                .do(function () {
                _this.next(__assign({}, state, (_a = {}, _a[inputName] = __assign({}, state[inputName], { pending: false }), _a)));
                var _a;
            });
        }
        else {
            return Observable$1.of(formValue);
        }
        var _a, _b;
    };
    InputObservable.prototype.handleBeforeValidation = function (formValue) {
        var inputName = Object.keys(formValue)[0];
        var field = this.fields[inputName];
        var state = this.getValue();
        if (typeof field.beforeValidation === 'function') {
            var element = this.inputElements.find(function (input) { return input.name === inputName; });
            var value = field.beforeValidation(formValue[inputName].value, this.formatState(state), this.props);
            if (element && typeof value === 'string') {
                element.value = value;
            }
            return _a = {}, _a[inputName] = __assign({}, formValue[inputName], { value: value }), _a;
        }
        else {
            return formValue;
        }
        var _a;
    };
    InputObservable.prototype.handleAfterValidation = function (formValue) {
        var inputName = Object.keys(formValue)[0];
        var field = this.fields[inputName];
        var state = this.getValue();
        if (typeof field.afterValidation === 'function') {
            var value = field.afterValidation(formValue[inputName].value, this.formatState(state), this.props);
            return _a = {}, _a[inputName] = __assign({}, formValue[inputName], { value: value }), _a;
        }
        else {
            return formValue;
        }
        var _a;
    };
    InputObservable.prototype.addInputs = function (inputElements, selectElements) {
        if (selectElements === void 0) { selectElements = []; }
        this.inputElements = this.inputElements.concat(inputElements);
        var text$ = createInputObservable({
            elements: inputElements,
            event: this.textEvent,
            types: InputObservable.TEXT_INPUT,
        }).map(this.standardInputFormatter);
        var radio$ = createInputObservable({
            elements: inputElements,
            event: this.radioEvent,
            types: InputObservable.RADIO_INPUT,
        }).map(this.standardInputFormatter);
        var checkbox$ = createInputObservable({
            elements: inputElements,
            event: this.checkboxEvent,
            types: InputObservable.CHECKBOX_INPUT,
        }).map(this.checkboxInputFormatter);
        var select$ = createSelectObservable({ elements: selectElements }).map(this.standardInputFormatter);
        this.subscriptions.push(Observable$1.merge(text$, radio$, checkbox$, select$)
            .map(this.handleBeforeValidation)
            .switchMap(this.handleError)
            .map(this.handleAfterValidation)
            .subscribe(this.handleSubscribe));
    };
    InputObservable.TEXT_INPUT = ['text', 'search', 'email', 'password', 'date', 'range', 'number'];
    InputObservable.RADIO_INPUT = ['radio'];
    InputObservable.CHECKBOX_INPUT = ['checkbox'];
    __decorate([
        autobind
    ], InputObservable.prototype, "setValue", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "standardInputFormatter", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "checkboxInputFormatter", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "handleSubscribe", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "handleError", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "handleBeforeValidation", null);
    __decorate([
        autobind
    ], InputObservable.prototype, "handleAfterValidation", null);
    return InputObservable;
}(BehaviorSubject$1));

var FormObservable = (function (_super) {
    __extends(FormObservable, _super);
    function FormObservable(input$, onError, formElement) {
        if (onError === void 0) { onError = function (error) { }; }
        var _this = _super.call(this) || this;
        _this.input$ = input$;
        _this.onError = onError;
        _this.hasError = false;
        if (formElement) {
            _this.init(formElement);
        }
        return _this;
    }
    FormObservable.prototype.handleFormSubmit = function (event) {
        var _this = this;
        event.preventDefault();
        var errorObject = {};
        var inputValues = this.input$.getValue();
        this.hasError = false;
        var formValue = Object.keys(inputValues).reduce(function (obj, fieldName) {
            if (inputValues[fieldName].error) {
                _this.hasError = true;
                errorObject = __assign({}, errorObject, (_a = {}, _a[fieldName] = inputValues[fieldName].error, _a));
            }
            return __assign({}, obj, (_b = {}, _b[fieldName] = inputValues[fieldName].value, _b));
            var _a, _b;
        }, {});
        if (this.hasError) {
            this.onError(errorObject);
        }
        return formValue;
    };
    FormObservable.prototype.init = function (element) {
        var _this = this;
        return createFormObservable({ element: element, event: FormObservable.EVENT })
            .map(this.handleFormSubmit)
            .filter(function () { return !_this.hasError; })
            .subscribe(this.next.bind(this));
    };
    FormObservable.EVENT = 'submit';
    __decorate([
        autobind
    ], FormObservable.prototype, "handleFormSubmit", null);
    return FormObservable;
}(Subject$1));

var initialState = {
    dirty: false,
    formValue: {},
    submitted: false,
};
var rxForm = function (_a) {
    var fields = _a.fields, valueChangeObs = _a.valueChangeObs, _b = _a.debounce, debounce = _b === void 0 ? 300 : _b, _c = _a.throttle, throttle = _c === void 0 ? 0 : _c, beforeSubmit = _a.beforeSubmit, afterSubmit = _a.afterSubmit;
    return function (Comp) {
        var RxForm = (function (_super) {
            __extends(RxForm, _super);
            function RxForm() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = _this.initState();
                _this.valueChange$ = new InputObservable({
                    fields: fields,
                    initialValue: _this.state.formValue,
                    props: _this.props,
                });
                _this.formSubmit$ = new FormObservable(_this.valueChange$, _this.props.onError);
                _this.valueChangeSubscription = new Subscription$1();
                _this.formSubmitSubscription = new Subscription$1();
                return _this;
            }
            RxForm.prototype.attachFormElement = function (instance) {
                var rootNode = findDOMNode(instance);
                if (rootNode) {
                    if (rootNode.tagName === 'FORM') {
                        this.formElement = rootNode;
                    }
                    else {
                        var formElement = rootNode.querySelector('form');
                        if (formElement) {
                            this.formElement = formElement;
                        }
                        else {
                            throw new Error(RxFormError.FORM);
                        }
                    }
                }
            };
            RxForm.prototype.initSimplifiedFormValue = function () {
                var _this = this;
                return Object.keys(fields).reduce(function (acc, fieldName) {
                    var fieldMeta = fields[fieldName];
                    return __assign({}, acc, (_a = {}, _a[fieldName] = typeof fieldMeta.value === 'function' ? fieldMeta.value(_this.props) : fieldMeta.value || '', _a));
                    var _a;
                }, {});
            };
            RxForm.prototype.initState = function () {
                var _this = this;
                return Object.keys(fields).reduce(function (state, fieldName) {
                    var fieldMeta = fields[fieldName];
                    var fieldValue = typeof fieldMeta.value === 'function' ? fieldMeta.value(_this.props) : fieldMeta.value || '';
                    var dirty = fieldValue !== '';
                    var fieldError;
                    if (fieldMeta.validation) {
                        fieldError = fieldMeta.validation(fieldValue, _this.initSimplifiedFormValue(), _this.props);
                    }
                    return __assign({}, state, { dirty: state.dirty || dirty, formValue: __assign({}, state.formValue, (_a = {}, _a[fieldName] = {
                            dirty: dirty,
                            error: fieldError,
                            value: fieldValue,
                        }, _a)) });
                    var _a;
                }, initialState);
            };
            RxForm.prototype.setInitialInputValues = function () {
                var _this = this;
                Object.keys(fields).forEach(function (inputName) {
                    var inputElements = _this.inputElements.filter(function (element) { return element.getAttribute('name') === inputName; });
                    var selectElements = _this.selectElements.filter(function (element) { return element.getAttribute('name') === inputName; });
                    var fieldValue = _this.state.formValue[inputName].value;
                    if (inputElements[0] && fieldValue) {
                        switch (inputElements[0].getAttribute('type')) {
                            case 'checkbox':
                                if (typeof fieldValue === 'boolean') {
                                    inputElements[0].checked = !!fieldValue;
                                }
                                else {
                                    throw new Error(inputName + " " + RxFormError.TYPE + " boolean");
                                }
                                break;
                            case 'radio':
                                if (typeof fieldValue === 'string') {
                                    inputElements.some(function (element) {
                                        if (element.getAttribute('value') === fieldValue) {
                                            element.checked = true;
                                            return true;
                                        }
                                        return false;
                                    });
                                }
                                else {
                                    throw new Error(inputName + " " + RxFormError.TYPE + " string");
                                }
                                break;
                            case 'date':
                                if (fieldValue instanceof Date) {
                                    inputElements[0].value = new Date(fieldValue.toString()).toISOString().substr(0, 10);
                                }
                                else {
                                    throw new Error(inputName + " " + RxFormError.TYPE + " Date");
                                }
                                break;
                            case 'range':
                            case 'number':
                                if (typeof fieldValue === 'number') {
                                    inputElements[0].value = fieldValue.toString();
                                }
                                else {
                                    throw new Error(inputName + " " + RxFormError.TYPE + " number");
                                }
                                break;
                            default:
                                if (typeof fieldValue === 'string') {
                                    inputElements[0].value = fieldValue.toString();
                                }
                                else {
                                    throw new Error(inputName + " " + RxFormError.TYPE + " string");
                                }
                                break;
                        }
                    }
                    if (selectElements[0] && fieldValue) {
                        if (typeof fieldValue === 'string') {
                            Array.from(selectElements[0].querySelectorAll('option')).forEach(function (optionElement) {
                                optionElement.selected = optionElement.value === fieldValue;
                            });
                        }
                        else {
                            throw new Error(inputName + " " + RxFormError.TYPE + " string");
                        }
                    }
                });
            };
            RxForm.prototype.hasError = function () {
                var _this = this;
                var hasError = false;
                Object.keys(fields).some(function (fieldName) {
                    if (_this.state.formValue[fieldName].error) {
                        hasError = true;
                        return true;
                    }
                    return false;
                });
                return hasError;
            };
            RxForm.prototype.handleAddInputs = function (inputsNames, selectNames) {
                var _this = this;
                if (selectNames === void 0) { selectNames = []; }
                this.valueChange$.addInputs(inputsNames.reduce(function (acc, inputName) {
                    var inputs = Array.from(_this.formElement.querySelectorAll("input[name=" + inputName + "]"));
                    return acc.concat(inputs);
                }, []), selectNames.map(function (selectName) { return document.querySelector("select[name=" + selectName + "]"); }));
            };
            RxForm.prototype.setValue = function (state) {
                var key = Object.keys(state)[0];
                if (!fields[key].customInput) {
                    this.inputElements.filter(function (element) { return element.getAttribute('name') === key; }).forEach(function (element) {
                        element.value = state[key];
                    });
                }
                this.valueChange$.setValue((_a = {}, _a[key] = __assign({}, this.state.formValue[key], { value: state[key] }), _a));
                var _a;
            };
            RxForm.prototype.handleValueChangeSuccess = function (formValue) {
                this.setState({
                    dirty: true,
                    formValue: formValue,
                });
            };
            RxForm.prototype.handleFilterInputs = function (element) {
                return element.hasAttribute('name');
            };
            RxForm.prototype.componentDidMount = function () {
                var _this = this;
                this.inputElements = Array.from(this.formElement.querySelectorAll('input')).filter(this.handleFilterInputs);
                this.selectElements = Array.from(this.formElement.querySelectorAll('select')).filter(this.handleFilterInputs);
                this.formElement.setAttribute('novalidate', 'true');
                this.setInitialInputValues();
                this.valueChange$.addInputs(this.inputElements, this.selectElements);
                this.formSubmit$.init(this.formElement);
                this.valueChangeSubscription = this.valueChange$
                    .debounceTime(debounce)
                    .throttleTime(throttle)
                    .subscribe(this.handleValueChangeSuccess);
                this.formSubmitSubscription = this.formSubmit$
                    .map(function (formValue) {
                    return typeof beforeSubmit === 'function' ? beforeSubmit(formValue, _this.props) : formValue;
                })
                    .do(function () { return _this.setState({ submitted: true }); })
                    .subscribe(function (formValue) {
                    _this.props.onSubmit(formValue);
                    if (typeof afterSubmit === 'function') {
                        afterSubmit(formValue, _this.props);
                    }
                });
            };
            RxForm.prototype.componentWillUnmount = function () {
                this.formSubmitSubscription.unsubscribe();
                this.valueChangeSubscription.unsubscribe();
                this.valueChange$.unsubscribe();
            };
            RxForm.prototype.render = function () {
                return (createElement(Comp, __assign({ ref: this.attachFormElement, "formSubmit$": this.formSubmit$, "valueChange$": valueChangeObs ? this.valueChange$ : null, setValue: this.setValue, addInputs: this.handleAddInputs, valid: !this.hasError(), submitted: this.state.submitted }, this.state.formValue, this.props)));
            };
            RxForm.displayName = "RxForm(" + (Comp.displayName || Comp.name) + ")";
            RxForm.defaultProps = {
                onError: function () { },
            };
            __decorate([
                autobind
            ], RxForm.prototype, "attachFormElement", null);
            __decorate([
                autobind
            ], RxForm.prototype, "handleAddInputs", null);
            __decorate([
                autobind
            ], RxForm.prototype, "setValue", null);
            __decorate([
                autobind
            ], RxForm.prototype, "handleValueChangeSuccess", null);
            return RxForm;
        }(Component));
        return RxForm;
    };
};

var wizard = function (_a) {
    var _b = _a.initialStep, initialStep = _b === void 0 ? 0 : _b, steps = _a.steps, _c = _a.submitStep, submitStep = _c === void 0 ? steps.length - 2 : _c;
    return function (Comp) {
        var RxWizardForm = (function (_super) {
            __extends(RxWizardForm, _super);
            function RxWizardForm() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.steps = typeof steps === 'function' ? steps(_this.props) : steps;
                _this.state = {
                    currentStep: initialStep,
                    formValue: {},
                    submitted: false,
                    totalSteps: _this.steps.length,
                };
                return _this;
            }
            RxWizardForm.prototype.goTo = function (step) {
                this.setState({
                    currentStep: step,
                });
            };
            RxWizardForm.prototype.handleSubmit = function (formValue) {
                var _this = this;
                var submitted = this.state.currentStep === submitStep;
                var currentStep = this.state.currentStep < submitStep ? this.state.currentStep + 1 : this.state.currentStep;
                console.log('submitStep', submitStep);
                console.log('currentStep', currentStep);
                console.log('wizard formValue submit', formValue);
                this.setState({
                    currentStep: currentStep,
                    formValue: __assign({}, this.state.formValue, formValue),
                    submitted: submitted,
                }, function () {
                    if (submitted) {
                        _this.props.onSubmit(_this.state.formValue);
                    }
                });
            };
            RxWizardForm.prototype.handleGoBack = function () {
                if (this.state.currentStep !== 0) {
                    this.setState({
                        currentStep: this.state.currentStep - 1,
                    });
                }
            };
            RxWizardForm.prototype.renderCurrentForm = function () {
                var _a = this.state, currentStep = _a.currentStep, formValue = _a.formValue;
                var FormComponent = this.steps[currentStep];
                return (createElement(FormComponent, __assign({}, this.props, formValue, { goBack: this.handleGoBack, onSubmit: this.handleSubmit, onError: this.props.onError })));
            };
            RxWizardForm.prototype.render = function () {
                return createElement(Comp, __assign({ goTo: this.goTo, renderCurrentForm: this.renderCurrentForm }, this.state, this.props));
            };
            RxWizardForm.displayName = "WizardForm(" + (Comp.displayName || Comp.name) + ")";
            __decorate([
                autobind
            ], RxWizardForm.prototype, "goTo", null);
            __decorate([
                autobind
            ], RxWizardForm.prototype, "handleSubmit", null);
            __decorate([
                autobind
            ], RxWizardForm.prototype, "handleGoBack", null);
            __decorate([
                autobind
            ], RxWizardForm.prototype, "renderCurrentForm", null);
            return RxWizardForm;
        }(Component));
        return RxWizardForm;
    };
};

var SimpleWizard = function (_a) {
    var renderCurrentForm = _a.renderCurrentForm;
    return renderCurrentForm();
};

export { rxForm, wizard, SimpleWizard };
