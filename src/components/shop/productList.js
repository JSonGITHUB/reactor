const productList = [
    {
        id: 1,
        name: 'Dodgers Front',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/DodgersOnWhiteFront.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/DodgersOnWhiteFront.png',
                back: 'assets/product/DodgersOnWhiteBackCenter.png'
            },
            black: {
                front: 'assets/product/DodgersOnBlackFront.png',
                back: 'assets/product/DodgersOnBlackBackCenter.png'
            }
        }
    },
    {
        id: 2,
        name: 'Dodgers Center',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/DodgersOnWhiteFrontCenter.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/DodgersOnWhiteFrontCenter.png',
                back: 'assets/product/DodgersOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/DodgersOnBlackFrontCenter.png',
                back: 'assets/product/DodgersOnBlackBack.png'
            }
        }
    },
    {
        id: 3,
        name: 'Dodgers Pocket',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/DodgersOnWhiteFrontPocket.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/DodgersOnWhiteFrontPocket.png',
                back: 'assets/product/DodgersOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/DodgersOnBlackFrontPocket.png',
                back: 'assets/product/DodgersOnBlackBack.png'
            }
        }
    },
    {
        id: 4,
        name: 'Miller Front',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/MillerOnWhiteFront.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/MillerOnWhiteFront.png',
                back: 'assets/product/MillerOnWhiteBackCenter.png'
            },
            black: {
                front: 'assets/product/MillerOnBlackFront.png',
                back: 'assets/product/MillerOnBlackBackCenter.png'
            }
        }
    },
    {
        id: 6,
        name: 'Miller Center',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/MillerOnWhiteFrontCenter.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/MillerOnWhiteFrontCenter.png',
                back: 'assets/product/MillerOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/MillerOnBlackFrontCenter.png',
                back: 'assets/product/MillerOnBlackBack.png'
            }
        }
    },
    {
        id: 7,
        name: 'Miller Pocket',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/MillerOnWhiteFrontPocket.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/MillerOnWhiteFrontPocket.png',
                back: 'assets/product/MillerOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/MillerOnBlackFrontPocket.png',
                back: 'assets/product/MillerOnBlackBack.png'
            }
        }
    },
    {
        id: 8,
        name: 'Tecate',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/TecateOnWhiteFront.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/TecateOnWhiteFront.png',
                back: 'assets/product/TecateOnWhiteBackCenter.png'
            },
            black: {
                front: 'assets/product/TecateOnBlackFront.png',
                back: 'assets/product/TecateOnBlackBackCenter.png'
            }
        }
    },
    {
        id: 9,
        name: 'Tecate Center',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/TecateOnWhiteFrontCenter.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/TecateOnWhiteFrontCenter.png',
                back: 'assets/product/TecateOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/TecateOnBlackFrontCenter.png',
                back: 'assets/product/TecateOnBlackBack.png'
            }
        }
    },
    {
        id: 10,
        name: 'Tecate Pocket',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/TecateOnWhiteFrontPocket.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/TecateOnWhiteFrontPocket.png',
                back: 'assets/product/TecateOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/TecateOnBlackFrontPocket.png',
                back: 'assets/product/TecateOnBlackBack.png'
            }
        }
    },
    {
        id: 11,
        name: 'KFA Low',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/KFAOnWhiteFrontLow.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/KFAOnWhiteFrontLow.png',
                back: 'assets/product/KFAOnWhiteBackNeck.png'
            },
            black: {
                front: 'assets/product/KFAOnBlackFrontLow.png',
                back: 'assets/product/KFAOnBlackBackNeck.png',
            }
        }
    },
    {
        id: 12,
        name: 'KFA Bottom',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/KFAOnWhiteFrontBottom.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/KFAOnWhiteFrontBottom.png',
                back: 'assets/product/KFAOnWhiteBackNeck.png'
            },
            black: {
                front: 'assets/product/KFAOnBlackFrontBottom.png',
                back: 'assets/product/KFAOnBlackBackNeck.png',
            }
        }
    },
    {
        id: 13,
        name: 'KFA',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/KFAOnWhiteFront.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/KFAOnWhiteFront.png',
                back: 'assets/product/KFAOnWhiteBack.png'
            },
            black: {
                front: 'assets/product/KFAOnBlackFront.png',
                back: 'assets/product/KFAOnBlackBack.png',
            }
        }
    },
    {
        id: 14,
        name: 'KFA Center',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/KFAOnWhiteFrontCenter.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front:'assets/product/KFAOnWhiteFrontCenter.png',
                back: 'assets/product/KFAOnWhiteBackNeck.png'
            },
            black: {
                front: 'assets/product/KFAOnBlackFrontCenter.png',
                back: 'assets/product/KFAOnBlackBackNeck.png',
            }
        }
    },
    {
        id: 15,
        name: 'KFA Pocket',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/KFAOnWhiteFrontPocket.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/KFAOnWhiteFrontPocket.png',
                back: 'assets/product/KFAOnWhiteBackBottom.png'
            },
            black: {
                front: 'assets/product/KFAOnBlackFrontPocket.png',
                back: 'assets/product/KFAOnBlackBackBottom.png',
            }
        }
    },
    {
        id: 16,
        name: 'Froth',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/FrothOnWhiteFront.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/FrothOnWhiteFront.png',
                back: 'assets/product/FrothOnWhiteBackTop.png'
            },
            black: {
                front: 'assets/product/FrothOnBlackFront.png',
                back: 'assets/product/FrothOnBlackBackNeck.png',
            }
        }
    },
    {
        id: 17,
        name: 'Froth Center',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/FrothOnWhiteFrontCenter.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/FrothOnWhiteFrontCenter.png',
                back: 'assets/product/FrothOnWhiteBackTop.png'
            },
            black: {
                front: 'assets/product/FrothOnBlackFrontCenter.png',
                back: 'assets/product/FrothOnBlackBack.png'
            }
        }
    },
    {
        id: 18,
        name: 'Froth Pocket',
        price: 149.99,
        description: 'Comfy and crisp',
        image: 'assets/product/FrothOnWhiteFrontPocket.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: {
            white: {
                front: 'assets/product/FrothOnWhiteFrontPocket.png',
                back: 'assets/product/FrothOnWhiteBackTop.png'
            },
            black: {
                front: 'assets/product/FrothOnBlackFrontPocket.png',
                back: 'assets/product/FrothOnBlackBackNeck.png'
            }
        }
    }
];
export default productList;