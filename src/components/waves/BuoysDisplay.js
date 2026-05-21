import getKey from '../utils/KeyGenerator.js';
import icons from '../site/icons.js';

const BuoysDisplay = () => {
    const bouys = [
        {
            title: 'Leucadia Nearshore',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46274'
        },
        {
        title: 'Oceanside Offshore',
        src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224'
        },
        {
            title: 'Torrey Pines Outer',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46225'
        },
        {
            title: 'Del Mar Nearshore',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46266'
        },
        {
            title: 'SCRIPPS Nearshore',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46254'
        },
        {
            title: 'La Jolla LJAC1',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJAC1'
        },
        {
            title: 'La Jolla LJPC1',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJPC1'
        },
        {
            title: 'Point Loma South',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46232'
        }
    ];
    const menu = () => {
        const classes = 'maxWidth400 m-5 r-10 ht-400 horizontalItem';
        const portraitButton = (item, index) => <iframe src={item.src} title={item.title} key={getKey(`index${index}`)} className={classes}></iframe>;
        const menuItems = bouys.map((item) => portraitButton(item));
        return menuItems;
    }

    return <div className=''>
                {/*
                <div className='containerDetail color-yellow bg-lite p-20 size20 contentLeft'>
                    <span className='size30 m-5'>🌊</span> Buoys
                </div>
                */}
                <div className='containerDetail bg-tintedMedium h-scroll'>
                    {menu()}
                </div>
                <div className='containerDetail p-10 mb-5 mt-5 button bg-lite size15'>
                    <a 
                        className='color-neogreen' 
                        href='https://www.tide-forecast.com/tide/Bahia-de-Ballenas-Baja-California-Sur-Mexico/sea-conditions' 
                        target='_blank' 
                        rel='noopener noreferrer'
                    >
                        {icons.buoys} Bahia-de-Ballenas-Baja-California-Sur-Mexico
                    </a>
                </div>
            </div>
}
export default BuoysDisplay;