import React, { useEffect, useState, useRef } from 'react';
import productList from './productList'
import getKey from '../utils/KeyGenerator';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const Product = () => {


    const productDisplay = useRef(null);
    const cartDisplay = useRef(null);
    const [cartCollapse, setCartCollapse] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [product, setProduct] = useState();
    const [displayImage, setDisplayImage] = useState();
    const [isFront, setIsFront] = useState(true);
    const [color, setColor] = useState('');
    const [size, setSize] = useState();

    useEffect(() => {
        setProduct(productList[0]); 
    }, []);
    useEffect(() => {
        if (product) {
            const colorKeys = Object.keys(product.colors || {});
            if (colorKeys.length === 0) {
                setDisplayImage(product.image);
                return;
            }
            const activeColor = color && product.colors?.[color] ? color : colorKeys[0];
            if (activeColor !== color) {
                setColor(activeColor);
            }
            const nextImage = isFront
                ? product.colors?.[activeColor]?.front
                : product.colors?.[activeColor]?.back;
            setDisplayImage(nextImage || product.image);
        };
    }, [color, isFront, product]);
    useEffect(() => {
        if (product) {
            const firstColor = Object.keys(product.colors || {})[0] || '';
            setColor(firstColor);
            setDisplayImage((firstColor && product.colors?.[firstColor]?.front) || product.image);
            setIsFront(true);
        }
    }, [product]);
    useEffect(() => {
        console.log(`color: ${color}`)
    }, [color]);
    useEffect(() => {
        console.log(`size: ${size}`)
    }, [size]);
    const nextProduct = () => {
        const nextIndex = (productList.indexOf(product) + 1) % productList.length;
        setProduct(productList[nextIndex]);
        gotoTop();
    }
    const previousProduct = () => {
        const nextIndex = (productList.indexOf(product) - 1) % productList.length;
        setProduct(productList[(nextIndex > -1) ? nextIndex : productList.length-1]);
        gotoTop();
    }
    const toggleFront = () => setIsFront(prev => !prev);
    const getTotal = () => {
        let total = 0;
        cart.forEach((item) => {
            total = total + item.total;
        });
        return total;
    }
    const gotoTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
    const gotoCart = () => {
        if (cartDisplay.current !== null) {
            console.log(`cartDisplay.current.clientHeight: ${cartDisplay}`);
            console.log(`productDisplay.current.clientHeight: ${productDisplay.current.clientHeight}`);
            window.scrollTo({
                top: document.documentElement.scrollHeight + 400,
                behavior: 'smooth',
            });
        }
    }
    const handleAddToCart = () => {
        const newCart = [...cart];
        console.log(`size: ${size}`)
        console.log(`product: ${JSON.stringify(product, null, 2)}`);
        let sizeSelect = false;
        const getSize = () => {
            const selectedSize = (size !== null && size !== undefined) ? size : prompt('enter size (S,M,L,XL): ', 'L').toUpperCase();
            if (product && !product.sizes.includes(selectedSize)) {
                alert('select a size');
                return
            }
            setSize(selectedSize)
            sizeSelect = true;
            return selectedSize;
        }
        const item = {
            ...product,
            quantity,
            total: product.price * quantity,
            size: getSize(),
            color: color,
            //image: displayImage
            image: product.colors?.[color]?.front || product.image
        };
        if (sizeSelect) {
            newCart.push(item);
            setCart(newCart);
            gotoCart();
        }
    };
    const removeItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    }

    const pickColor = (key, value) => {
        setDisplayImage(value.front);
        setColor(key);
        setIsFront(true);
    }

    const formatCurrency = (num) =>
        '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    return (
        <div className='pt-20'>
            <div className='mt-10 ml-5 mr-5 containerDetail bg-lite'>
                <div ref={productDisplay}>
                    <div className='containerDetail contentLeft p-20 color-yellow mb-5 bg-lite'>
                        <div className='size30'>
                            {product && (
                                product.name
                            )}
                        </div>
                    </div>
                    <div className='containerDetail bg-white product' onClick={toggleFront}>
                        {product && (
                            <img 
                                title={`${product.name}:  ${color}`} 
                                src={displayImage} 
                                alt={product.name} 
                                className={`containerDetail bg-white width-100-percent ${(!isFront && (((product.name === 'KFA Low' || product.name === 'KFA Bottom' || product.name === 'KFA' || product.name === 'KFA Center' || product.name === 'KFA Pocket' || product.name === 'Froth' || product.name === 'Froth Center' || product.name === 'Froth Pocket') && color === 'black') || ((color === 'white') && (product.name === 'Froth Pocket' || product.name === 'Froth Center' || product.name === 'Froth' || product.name === 'Dodgers Front' || product.name === 'Miller Front' || product.name === 'Tecate'))))?'productImage':''}`}
                            />
                        )}
                        <div className='size15'>
                            {color}
                        </div>
                    </div>
                    <div className='containerDetail size20 flexContainer mt-5 mb-5'>
                        <div title='front' className={`containerDetail flex2Column button m-5 p-10 color-lite ${(isFront) ? 'bg-green':''}`} onClick={() => setIsFront(true)}>
                            FRONT
                        </div>
                        <div title='back' className={`containerDetail flex2Column button m-5 p-10 color-lite ${(!isFront) ? 'bg-green' : ''}`} onClick={() => setIsFront(false)}>
                            BACK
                        </div>
                    </div>

                    <div className='containerDetail flexContainer bg-white contentLeft'>
                        {
                            (product && (
                                Object.entries(product.colors).map(([key, value]) => (
                                    <div 
                                        key={getKey(key)}
                                        title={`${product.name}:  ${key}`} 
                                        className={`containerDetail flex${Object.keys(product.colors).length}Column bg-white m-10 heightt-100px width-100 contentCenter size15 button`}
                                        onClick={() => pickColor(key,value)}
                                    >
                                        <img
                                            src={value.front}
                                            alt={product.name}
                                            className='ht-100'
                                        />
                                        <div className={`containerDetail size20 color-dark copyright ${(color === key) ? 'bg-green color-white' :'bg-white color-dark'}`}>{key}</div>
                                    </div>
                                )))
                            )
                        }
                    </div>
                    <div className='containerDetail flexContainer p-10 contentLeft mt-5 mb-5'>
                        {
                            product && (product.sizes.map((sizeLabel) => <div key={getKey(sizeLabel)} onClick={() => setSize(sizeLabel)} className={`containerDetail button flex${product.sizes.length}Column p-10 contentCenter ${(size === sizeLabel) ? 'bg-green' :'bg-lite'} m-1 width-50 color-lite size20`}>{sizeLabel}</div>))
                        }
                    </div>
                    {/*
                    <div className='containerDetail pt-10 pb-10 contentLeft'>
                        
                            <div className='mt-10 size15'>
                            {product && (
                                product.description
                            )}
                        </div>
                        <div className='mt-10 size15'>
                            {product && (
                                formatCurrency(product.price)
                            )}
                        </div>
                    </div>
                    */}
                    <div className='containerDetail pl-20 pt-10 pb-10 pr-10 bg-lite contentLeft size20 color-lite'>
                        Quantity:
                        <span>
                            <label>
                                <input
                                    type='number'
                                    value={quantity}
                                    min='1'
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className='containerDetail width-50-percent ml-10 color-lite'
                                />
                            </label>
                        </span>
                    </div>
                </div>
                {
                    cart.length > 0 && (
                        <div className='containerDetail mt-10 bg-lite' ref={cartDisplay}>
                            <div className='containerBox'>
                                <CollapseToggleButton
                                    title={<span className='color-yellow'>{icons.shop} {cart.length}</span>}
                                    isCollapsed={cartCollapse}
                                    setCollapse={setCartCollapse}
                                    align='left'
                                />
                            </div>
                            <div>
                                {
                                    (cartCollapse)
                                    ? null
                                    : cart.map((item, index) => <div className='containerBox flexContainer' key={getKey(index)}>
                                                <div className='flex2Column contentRight'>
                                                    <img
                                                        title={`${item.name}:  ${item.color} ${item.size} X ${item.quantity} = ${formatCurrency(item.total)}`}
                                                        src={item.image}
                                                        alt={item.name}
                                                        className='containerBox bg-white width-100-percent'
                                                    />
                                                </div>
                                                <div className='containerDetail flex2Column contentLeft bg-lite m-5'>
                                                    <div className='containerDetail flexContainer mb-5 pb-5 pt-5'>
                                                        <div className='flex2Column contentLeft color-yellow pl-5'>{item.name}</div>
                                                        <div className='flex2Column contentRight'><span onClick={()=>removeItem(index)} title='remove item' className='r-5 button pt-5 pb-5 pl-10 pr-5 size15'>{icons.delete}</span></div>
                                                    </div>
                                                    <div className='containerDetail size12 p-10 m-1'>
                                                        <div>quantity: {item.quantity}</div>
                                                        <div>size: {item.size}</div>
                                                        <div>color: {item.color}</div>
                                                        <div>price: {formatCurrency(item.total)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                    )
                                }
                                {
                                    
                                    (cartCollapse)
                                    ? null
                                    : <div className='containerBox bold color-yellow'>Cart Total: ${getTotal()}</div>
                                }
                            </div>
                        
                        </div>
                    )
                }
            </div>
            <div className='ht-100'></div>
            <div className='containerDetail ml-5 width--10 footer flexContainer'>
                <button 
                    title={`add to cart ${quantity} ${size} ${color} ${(product) ? `${product.name} ${(product.price * quantity)}` : null}`} 
                    onClick={handleAddToCart} 
                    className='flex4Column containerBox button mt-10 bg-neogreen'
                >
                    {icons.plus} {icons.shop}
                </button>
                <button 
                    title='previous product' 
                    onClick={previousProduct} 
                    className='flex4Column containerBox button mt-10 bg-yellow'
                >
                    {icons.leftArrow} 👕
                </button>
                <button 
                    title='next product' 
                    onClick={nextProduct} 
                    className='flex4Column containerBox button mt-10 bg-yellow'
                >
                    👕 {icons.rightArrow}
                </button>
                <button 
                    title={`add to cart ${quantity} ${size} ${color} ${(product) ? `${product.name} ${(product.price * quantity)}` : null}`} 
                    onClick={gotoCart} 
                    className='flex4Column containerBox button mt-10 bg-neogreen color-dark'
                >
                    {`${(cart.length > 0) ? cart.length : ''}`} {icons.shop} {`${(cart.length>0) ? `$${getTotal()}` : ''}`}
                </button>
            </div>
        </div>
    );
};

export default Product;