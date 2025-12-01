import React from 'react';

export default function Pricing() {
    return (
        <div className='containerDetail bg-lite color-lite size20 p-5 ml-5 mr-5 mb-5 mt--20'>
            <div className='containerDetail size30 color-yellow contentLeft p-20 m-5 bg-lite'>
                Choose Your Plan
            </div>
            <div className='size30 contentLeft'>
                <div className='containerDetail bg-lite m-5'>
                    <div className='containerDetail size30 color-yellow contentLeft p-15'>
                        Free
                    </div>
                    <div className='containerDetail size20 contentLeft p-20 mt-5'>
                        <p>$0 / month</p>
                        ✔ Basic features<br/>
                        ✔ Limited usage
                    </div>
                    <div className='containerDetail button color-yellow size20 contentLeft p-20 mt-5 bg-blue mb-5'>
                        Get Started
                    </div>
                </div>

                <div className='containerDetail bg-lite m-5'>
                    <div className='containerDetail size30 color-yellow contentLeft p-15'>
                        Pro
                    </div>
                    <div className='containerDetail size20 contentLeft p-20 mt-5'>
                        <p>$12 / month</p>
                        ✔ Unlimited features<br/>
                        ✔ Priority support
                    </div>
                    <div 
                        className='containerDetail button color-yellow size20 contentLeft p-20 mt-5 bg-blue mb-5' 
                        onClick={() => window.location.href = '/checkout'}
                    >
                        Upgrade
                    </div>
                </div>
            </div>
        </div>
    );
}