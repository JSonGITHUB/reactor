import React, { useMemo, useState } from 'react';

const BAG_TYPES = [
	{ weight: 90, bagsPerPallet: 35 },
	{ weight: 60, bagsPerPallet: 56 },
	{ weight: 50, bagsPerPallet: 64 },
];

const BLOCK_TYPES = [
	{ id: '8x8x16', label: '8x8x16', blocksPerPallet: 90 },
	{ id: '8x8x16-bond-beam', label: '8x8x16 bond beam', blocksPerPallet: 90 },
	{ id: '6x8x16', label: '6x8x16', blocksPerPallet: 120 },
];

const parseRequestedBags = (value) => {
	const numericValue = Number.parseInt(value, 10);
	if (Number.isNaN(numericValue) || numericValue < 0) {
		return 0;
	}
	return numericValue;
};

const calculatePalletPlan = (requestedBags, bagsPerPallet) => {
	const pallets = Math.floor(requestedBags / bagsPerPallet);
	const leftoverBags = requestedBags % bagsPerPallet;

	return {
		pallets,
		leftoverBags,
	};
};

const Concrete = () => {
	const [requestedByWeight, setRequestedByWeight] = useState({
		90: '',
		60: '',
		50: '',
	});
	const [requestedByBlockType, setRequestedByBlockType] = useState({
		'8x8x16': '',
		'8x8x16-bond-beam': '',
		'6x8x16': '',
	});

	const handleRequestChange = (weight, value) => {
		// Keep only digits so requests stay as non-negative whole bag counts.
		const sanitizedValue = value.replace(/[^0-9]/g, '');
		setRequestedByWeight((previousState) => ({
			...previousState,
			[weight]: sanitizedValue,
		}));
	};

	const handleBlockRequestChange = (blockTypeId, value) => {
		// Keep only digits so requests stay as non-negative whole block counts.
		const sanitizedValue = value.replace(/[^0-9]/g, '');
		setRequestedByBlockType((previousState) => ({
			...previousState,
			[blockTypeId]: sanitizedValue,
		}));
	};

	const results = useMemo(() => BAG_TYPES.map(({ weight, bagsPerPallet }) => {
		const requestedBags = parseRequestedBags(requestedByWeight[weight]);
		const { pallets, leftoverBags } = calculatePalletPlan(requestedBags, bagsPerPallet);

		return {
			weight,
			bagsPerPallet,
			requestedBags,
			pallets,
			leftoverBags,
		};
	}), [requestedByWeight]);

	const blockResults = useMemo(() => BLOCK_TYPES.map(({ id, label, blocksPerPallet }) => {
		const requestedBlocks = parseRequestedBags(requestedByBlockType[id]);
		const { pallets, leftoverBags } = calculatePalletPlan(requestedBlocks, blocksPerPallet);

		return {
			id,
			label,
			blocksPerPallet,
			requestedBlocks,
			pallets,
			leftoverBlocks: leftoverBags,
		};
	}), [requestedByBlockType]);

	const enteredResults = useMemo(() => results.filter((result) => requestedByWeight[result.weight] !== ''), [results, requestedByWeight]);
	const enteredBlockResults = useMemo(() => blockResults.filter((result) => requestedByBlockType[result.id] !== ''), [blockResults, requestedByBlockType]);
	const hasAnyRequest = enteredResults.length > 0 || enteredBlockResults.length > 0;

	return (
		<div className='containerDetail mt--25 color-yellow contentLeft' role='region' aria-labelledby='concrete-calculator-title'>
			<h2 id='concrete-calculator-title' className='mb-5 containerDetail p-20 size20 color-yellow'>
                Concrete Calculator
            </h2>
			<div className='mb-5 containerDetail size20 color-yellow'>
				<div className='mb-5 containerDetail p-10 bg-yellow color-dark'>
                    Pallet Configuration
                </div>
                {BAG_TYPES.map(({ weight, bagsPerPallet }) => (
                    <div 
                        key={weight}
                        className='mb-5 containerDetail flexContainer bg-lite size20 color-orange'
                    >
                        <div className='containerDetail pb-25 pt-25 flexColumn pl-10 pr-10 mb-5 color-orange size35'>
                            {weight}
                            <span className='size20 ml-2 color-yellow'>
                                lbs
                            </span>
                        </div>
                        <div className='containerDetail h-scroll bg-white mt--10 flex3Column m-5'>

                            {
                                (weight === 90) && (
                                    <div>
                                        <img 
                                            src={`${(weight === 90) ? 'https://images.thdstatic.com/productImages/345b2627-9fb5-4015-9a73-7e45b38a843d/svn/quikrete-concrete-110190-64_600.jpg' : (weight === 60) ? 'https://images.thdstatic.com/productImages/6890979c-02df-4564-bf0f-0fcc156d902e/svn/quikrete-mortar-mix-110260-64_600.jpg' : ''}`} 
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                        <img 
                                            src={`${(weight === 90) ? 'https://images.thdstatic.com/productImages/07f954eb-ecea-4521-995d-c8b69421c256/svn/westpac-materials-joint-compound-22167h-64_600.jpg' : (weight === 60) ? 'https://images.thdstatic.com/productImages/ce151ed3-22f5-4971-8f1e-ed1cc6c55c7b/svn/quikrete-concrete-110160-64_600.jpg' : ''}`} 
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                        <img 
                                            src={`${(weight === 90) ? 'https://images.thdstatic.com/productImages/9cf4e225-6abb-4a03-9d26-430e532a7f9a/svn/spec-mix-mortar-mix-0179594000-64_600.jpg' : (weight === 60) ? 'https://images.thdstatic.com/productImages/8ff38016-f341-4424-9d31-61fbf2f0da45/svn/spec-mix-mortar-mix-0179560000-64_600.jpg' : ''}`} 
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                    </div>
                                )
                            }
                            {
                                (weight === 60) && (
                                    <div className='containerDetail h-scroll bg-white mt--10'>
                                        <img 
                                            src='https://images.thdstatic.com/productImages/6890979c-02df-4564-bf0f-0fcc156d902e/svn/quikrete-mortar-mix-110260-64_600.jpg'
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                        <img 
                                            src='https://images.thdstatic.com/productImages/ce151ed3-22f5-4971-8f1e-ed1cc6c55c7b/svn/quikrete-concrete-110160-64_600.jpg' 
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                        <img 
                                            src='https://images.thdstatic.com/productImages/8ff38016-f341-4424-9d31-61fbf2f0da45/svn/spec-mix-mortar-mix-0179560000-64_600.jpg'
                                            alt={`${weight}lb bag`} 
                                            className='w-50' 
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/29142db0-21d8-458b-9e5d-bef75c6aad01/svn/rapid-set-concrete-03010060-64_600.jpg'
                                            alt='60lb bag'
                                            className='w-50'
                                        />
                                    </div>
                                )
                            }
                            {
                                (weight === 50) && (
                                    <div className='containerDetail bg-white mt--10 pl-10'>
                                        <img
                                            src='https://images.thdstatic.com/productImages/8cfc9793-1149-41e8-a2f5-2f9a8b5df8f1/svn/quikrete-concrete-100450-64_600.jpg'
                                            alt={`${weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/ad96ea64-2a52-423b-88ac-19de1a71a569/svn/quikrete-landscape-accessories-115251-64_600.jpg'
                                            alt={`${weight}lb bag`}
                                            className='w-50'
                                        />
                                    </div>
                                )
                            }
                        </div>
                        <div className='containerDetail flexColumn mt-5 color-orange pb-20 pt-20'>
                            pallet: <div className='mt-5 color-yellow'>{bagsPerPallet} bags</div>
                        </div>
                    </div>
                ))}
				{BLOCK_TYPES.map(({ id, label, blocksPerPallet }) => (
					<div
						key={id}
						className='mb-5 containerDetail p-10 bg-lite size20 color-orange'
					>
						<span className='color-yellow'>{label} pallet:</span> {blocksPerPallet} blocks
					</div>
				))}
			</div>

			<form className='mb-5 containerDetail size20 color-yellow ' onSubmit={(event) => event.preventDefault()}>
                <h3 className='containerDetail p-20 color-orange mb-5'>
                    Concrete Request
                </h3>
                <div className='mb-10 containerDetail size20 color-yellow p-20'>
                    {BAG_TYPES.map(({ weight }) => {
                        const inputId = `concrete-request-${weight}`;
                        return (
                            <div key={weight} className='mb-10'>
                                <div className='p-10'>
                                    <label htmlFor={inputId}>{weight}lb bags</label>
                                </div>
                                <input
                                    id={inputId}
                                    name={inputId}
                                    type='text'
                                    inputMode='numeric'
                                    value={requestedByWeight[weight]}
                                    onChange={(event) => handleRequestChange(weight, event.target.value)}
                                    aria-describedby={`${inputId}-hint`}
                                    className='containerDetail p-20 size20 ml-10 color-orange'
                                />
                            </div>
                        );
                    })}
                </div>
			</form>

			<form className='mb-5 containerDetail size20 color-yellow ' onSubmit={(event) => event.preventDefault()}>
                <h3 className='containerDetail p-20 color-orange mb-5'>
                    Block Request
                </h3>
                <div className='mb-10 containerDetail size20 color-yellow p-20'>
                    {BLOCK_TYPES.map(({ id, label }) => {
                        const inputId = `block-request-${id}`;
                        return (
                            <div key={id} className='mb-10'>
                                <div className='p-10'>
                                    <label htmlFor={inputId}>{label} blocks</label>
                                </div>
                                <input
                                    id={inputId}
                                    name={inputId}
                                    type='text'
                                    inputMode='numeric'
                                    value={requestedByBlockType[id]}
                                    onChange={(event) => handleBlockRequestChange(id, event.target.value)}
                                    className='containerDetail p-20 size20 color-orange'
                                />
                            </div>
                        );
                    })}
                </div>
			</form>

			{hasAnyRequest && (
				<div className='mb-5 containerDetail size20 color-yellow mt-5' aria-live='polite'>
					<div className='containerDetail p-10 bg-yellow mb-10 color-dark'>
                        Delivery Plan
                    </div>
					{enteredResults.map((result) => (
					<div key={result.weight} className='mb-15'>
                        <div className='containerDetail bg-lite p-10 size20 color-orange'>{result.weight}lb Bags</div>
                            {
                                (result.weight === 90) && (
                                    <div className='containerDetail bg-white mt-5 pl-10'>
                                        <img
                                            src={`${(result.weight === 90) ? 'https://images.thdstatic.com/productImages/345b2627-9fb5-4015-9a73-7e45b38a843d/svn/quikrete-concrete-110190-64_600.jpg' : (result.weight === 60) ? 'https://images.thdstatic.com/productImages/6890979c-02df-4564-bf0f-0fcc156d902e/svn/quikrete-mortar-mix-110260-64_600.jpg' : ''}`}
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src={`${(result.weight === 90) ? 'https://images.thdstatic.com/productImages/07f954eb-ecea-4521-995d-c8b69421c256/svn/westpac-materials-joint-compound-22167h-64_600.jpg' : (result.weight === 60) ? 'https://images.thdstatic.com/productImages/ce151ed3-22f5-4971-8f1e-ed1cc6c55c7b/svn/quikrete-concrete-110160-64_600.jpg' : ''}`}
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src={`${(result.weight === 90) ? 'https://images.thdstatic.com/productImages/9cf4e225-6abb-4a03-9d26-430e532a7f9a/svn/spec-mix-mortar-mix-0179594000-64_600.jpg' : (result.weight === 60) ? 'https://images.thdstatic.com/productImages/8ff38016-f341-4424-9d31-61fbf2f0da45/svn/spec-mix-mortar-mix-0179560000-64_600.jpg' : ''}`}
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                    </div>
                                )
                            }
                            {
                                (result.weight === 60) && (
                                    <div className='containerDetail bg-white mt-5 pl-10'>
                                        <img
                                            src='https://images.thdstatic.com/productImages/6890979c-02df-4564-bf0f-0fcc156d902e/svn/quikrete-mortar-mix-110260-64_600.jpg'
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/ce151ed3-22f5-4971-8f1e-ed1cc6c55c7b/svn/quikrete-concrete-110160-64_600.jpg'
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/8ff38016-f341-4424-9d31-61fbf2f0da45/svn/spec-mix-mortar-mix-0179560000-64_600.jpg'
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/29142db0-21d8-458b-9e5d-bef75c6aad01/svn/rapid-set-concrete-03010060-64_600.jpg'
                                            alt='60lb bag'
                                            className='w-50'
                                        />
                                    </div>
                                )
                            }
                            {
                                (result.weight === 50) && (
                                    <div className='containerDetail bg-white mt-5 pl-10'>
                                        <img
                                            src='https://images.thdstatic.com/productImages/8cfc9793-1149-41e8-a2f5-2f9a8b5df8f1/svn/quikrete-concrete-100450-64_600.jpg'
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                        <img
                                            src='https://images.thdstatic.com/productImages/ad96ea64-2a52-423b-88ac-19de1a71a569/svn/quikrete-landscape-accessories-115251-64_600.jpg'
                                            alt={`${result.weight}lb bag`}
                                            className='w-50'
                                        />
                                    </div>
                                )
                            }
                        <div className='containerDetail mt-5'>
                            <div className='p-10 flexContainer'>
                                <div className='flex2Column contentRight'>
                                    Request:
                                </div>
                                    <div className='flex2Column color-orange ml-5'>

                                    {result.requestedBags} bags
                                </div>
                            </div>
                             <div className='p-10 flexContainer'>
                                <div className='flex2Column contentRight'>
                                    Pallet{result.pallets === 1 ? '' : 's'}: 
                                </div>
                                <div className='flex2Column color-orange ml-5'>
                                    {result.pallets}
                                </div>
                            </div>
                            <div className='p-10 flexContainer'>
                                <div className='flex2Column contentRight'>
                                    Customer: 
                                </div>
                                <div className='flex2Column color-orange ml-5'>
                                    {result.leftoverBags} bag{result.leftoverBags === 1 ? '' : 's'}
                                </div>
                            </div>
					    </div>
                    </div>
					))}
					{enteredBlockResults.map((result) => (
						<div key={result.id} className='mb-15'>
							<div className='containerDetail bg-lite p-10 size20 color-orange'>{result.label} Blocks</div>
							<div className='p-10'>Request: <span className='color-orange'>{result.requestedBlocks} blocks</span></div>
							<div className='p-10'>Pallet{result.pallets === 1 ? '' : 's'}: <span className='color-orange'>{result.pallets}</span></div>
							<div className='p-10'>Customer: <span className='color-orange'>{result.leftoverBlocks} block{result.leftoverBlocks === 1 ? '' : 's'}</span></div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Concrete;
