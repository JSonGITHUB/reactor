// src/components/PhotoAssistant/SubjectForm.js
import React from 'react';
import PropTypes from 'prop-types';

export default function SubjectForm({
    subject,
    setSubject,
    description,
    setDescription,
    mode
}) {
    return (
        mode !== '' && (
                <div className=''>
                    <div className='containerDetail color-yellow contentLeft m-5 p-20 size20 bg-lite'>
                        Subject Information
                    </div>

                    {/* Subject */}
                    <div className='containerDetail m-5'>
                        <div className='containerDetail contentLeft p-10 color-yellow size20 mb-5'>
                            <label>
                                Subject
                            </label>
                        </div>
                        <div className='contentLeft'>
                            <input
                                type='text'
                                className='containerDetail color-lite size20 bg-dark width-100-percent p-10'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder='e.g., Bird in flight, Portrait, City skyline'
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className='containerDetail m-5'>
                        <div className='containerDetail contentLeft p-10 color-yellow size20 mb-5'>
                            <label>
                                Description / Notes
                            </label>
                        </div>
                        <textarea
                            className='containerDetail color-lite size20 bg-dark width-100-percent p-10'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Optional notes about the shot...'
                            rows={3}
                        />
                    </div>
                </div>
            )
    );
}

SubjectForm.propTypes = {
    subject: PropTypes.string.isRequired,
    setSubject: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    setDescription: PropTypes.func.isRequired
};