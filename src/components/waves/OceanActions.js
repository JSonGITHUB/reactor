const fetchOceanData = (uri) => async dispatch => {
    const [oceanData, setOceanData] = useState({});
    const { data } = await axios.get(uri, {
        params: {
            origin: '*',
            format: 'json',
            mode:'cors'
        }
    });
    console.log(`getOceanData => ${component}: \nuri: ${uri}\noceanData: ${JSON.stringify(data, null, 2)}`)
    setOceanData(data)
    dispatch({ 
        type: 'FETCH_POSTS', 
        payload: data
    })
    return [ oceanData ];
};


export { fetchOceanData }