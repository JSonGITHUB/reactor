const initData = [
    {
        "date":"Wed Jul 12 2023",
        "time":"3:32:47 AM",
        "expense":"3 Visas",
        "location":"Indonesia",
        "cost":"1529250",
        "currency":"IDR",
        "countryCode":"IDR"
    
    },  
    {
        "date":"Wed Jul 12 2023",
        "time":"3:09:09 PM",
        "expense":"Fruit",
        "location":"Indonesia",
        "cost":"7",
        "currency":"USD",
        "countryCode":"USD"
    },  
    {
        "date":"Wed Jul 12 2023",
        "time":"3:10:25 PM",
        "expense":"2 Pizzas",
        "location":"Indonesia",
        "cost":"140000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Wed Jul 12 2023",
        "time":"3:12:44 PM",
        "expense":"Bowls, Coffee, 2 Sugars, etc...",
        "location":"Indonesia",
        "cost":"7",
        "currency":"USD",
        "countryCode":"USD"
    },  
    {
        "date":"Thu Jul 13 2023",
        "time":"4:43:48 PM",
        "expense":"Dinner for 3 Mahi Mahi",
        "location":"Indonesia",
        "cost":"320000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Fri Jul 14 2023",
        "time":"1:50:23 PM",
        "expense":"Lunch",
        "location":"Indonesia",
        "cost":"100000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Sat Jul 15 2023",
        "time":"7:28:19 PM",
        "expense":"Sushi Dinner",
        "location":"Indonesia",
        "cost":"250000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 17 2023",
        "time":"9:41:42 PM",
        "expense":"Bowl, Spoons, Knife and Apples",
        "location":"Indonesia",
        "cost":"45000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 17 2023",
        "time":"9:42:41 PM",
        "expense":"Water and Vitamin C for Lukas",
        "location":"Indonesia",
        "cost":"20000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 17 2023",
        "time":"9:43:45 PM",
        "expense":"Chicken Curry and Indo Tea",
        "location":"Indonesia",
        "cost":"60000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 17 2023",
        "time":"9:46:27 PM",
        "expense":"Dinner for 2 Mahi-Mahi and Chicken Satay with Citrus Cucumber and Blueberry",
        "location":"Indonesia",
        "cost":"170000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 17 2023",
        "time":"9:51:24 PM",
        "expense":"4 Rolls of TP",
        "location":"Indonesia",
        "cost":"24000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 18 2023",
        "time":"5:420:59 PM",
        "expense":"Ayam Bakso",
        "location":"Indonesia",
        "cost":"25000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Wed Jul 19 2023",
        "time":"1:53:21 PM",
        "expense":"Indo Soup @ Lima",
        "location":"Indonesia",
        "cost":"38000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Wed Jul 19 2023",
        "time":"1:54:54 PM",
        "expense":"Dragon fruit, 6 Apples, 3 Limes, 1 Mango",
        "location":"Indonesia",
        "cost":"230000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Wed Jul 19 2023",
        "time":"1:57:13 AM",
        "expense":"Eggs on Sourdough, hashbrowns with salad and Acai bowl with coffee",
        "location":"Indonesia",
        "cost":"350000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Wed Jul 19 2023",
        "time":"8:56:50 PM",
        "expense":"Dinner for 2 Buger and Indo Soup, drinks and Banana Choco",
        "location":"Indonesia",
        "cost":"180000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Thur Jul 20 2023",
        "time":"3:31:22 PM",
        "expense":"Ulu cave park",
        "location":"Indonesia",
        "cost":"5000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Thur Jul 20 2023",
        "time":"3:31:50 PM",
        "expense":"Bingin park",
        "location":"Indonesia",
        "cost":"5000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Thur Jul 20 2023",
        "time":"3:32:22 PM",
        "expense":"Gas for Me and Titus",
        "location":"Indonesia",
        "cost":"150000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Fri Jul 21 2023",
        "time":"7:20:49 AM",
        "expense":"Dinner for 2 Pad Thai and Chicken Curry, Banana and Surfer Smoothie",
        "location":"Indonesia",
        "cost":"150000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Sat Jul 22 2023",
        "time":"10:17:00 PM",
        "expense":"Dinner for 2 Cabanera, Nasi Campur, Water and Surfer Smoothie",
        "location":"Indonesia",
        "cost":"150000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Sun Jul 23 2023",
        "time":"1:11:14 PM",
        "expense":"Dinner for 2 Poki Bowl @ District 6",
        "location":"Indonesia",
        "cost":"330000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Sun Jul 23 2023",
        "time":"1:11:56 PM",
        "expense":"Nasi Goreng @ Seed",
        "location":"Indonesia",
        "cost":"75000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Mon Jul 24 2023",
        "time":"7:40:18 PM",
        "expense":"Dinner @ District 6: Burger and Seared Tuna",
        "location":"Indonesia",
        "cost":"17.62",
        "currency":"USD",
        "countryCode":"USD"
    },  
    {
        "date":"Tue Jul 25 2023",
        "time":"9:25:41 PM",
        "expense":"Lunch @ Lima: 2 fried rice, Tea and Green Monster ",
        "location":"Indonesia",
        "cost":"130000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 25 2023",
        "time":"9:26:51 PM",
        "expense":"Ours Home Dinner: Poki and Nasi Gorang",
        "location":"Indonesia",
        "cost":"342804",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 25 2023",
        "time":"11:36:14 PM",
        "expense":"Gas",
        "location":"Indonesia",
        "cost":"40000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 25 2023",
        "time":"11:37:14 PM",
        "expense":"Dragon fruit, 2 Mangos, 2 Bananas, 2 Limes and 1 Papaya",
        "location":"Indonesia",
        "cost":"130000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 26 2023",
        "time":"6:57:57 PM",
        "expense":"Gado Gado and Cabenera on the Cliff",
        "location":"Indonesia",
        "cost":"230000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 26 2023",
        "time":"6:58:54 PM",
        "expense":"Sarong on the Cliff",
        "location":"Indonesia",
        "cost":"100000",
        "currency":"IDR",
        "countryCode":"IDR"
    },  
    {
        "date":"Tue Jul 26 2023",
        "time":"7:19:58 PM",
        "expense":"Dinner for 2 @ Lima: Chicken Curry and Fried Rice",
        "location":"Indonesia",
        "cost":"120000",
        "currency":"IDR",
        "countryCode":"IDR"
    }
];
export default initData;