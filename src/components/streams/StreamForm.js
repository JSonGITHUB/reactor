import React from 'react';
import { Field, reduxForm } from 'redux-form';

class StreamForm extends React.Component {
    renderError({ error, touched }) {
        if (touched && error) {
            return (
                <div className="ui error">
                    <div className="color-neogreen bold p-10">{error}</div>
                </div>
            );
        }
    };
    renderInput = ({ input, label, meta }) => {
        const className = `field ${meta.error && meta.touched ? 'error' : ''}`;
        return (
            <div className={className}>
                <label>{label}</label>
                <input {...input} autoComplete="off" />
                {this.renderError(meta)}
            </div>
        );
    };
    onSubmit = formValues => {
        this.props.onSubmit(formValues);
    };
    render() {
        return (
            <form
                onSubmit={this.props.handleSubmit(this.onSubmit)}
                className="ui form error p-20 r-5 bg-soft m-10"
            >
                <Field 
                    name="title" 
                    component={this.renderInput} 
                    label="Enter Title" 
                />
                <Field
                    name="description"
                    component={this.renderInput}
                    label="Enter Description"
                />
                <button className="bg-green glassy p-10 r-5">
                    Submit
                </button>
            </form>
        );
    }
}

const validate = formValues => {
    const errors = {};
    if (!formValues.title) { errors.title = 'You must enter a title' }
    if (!formValues.description) { errors.description = 'You must enter a description' }
    return errors;
};

export default reduxForm({
    form: 'streamForm',
    validate
})(StreamForm);