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
        const classes = 'maxWidth400 m-10 r-5 glassy height400 horizontalItem';
        const portraitButton = (item, index) => <iframe src={item.src} title={item.title} key={getKey(`index${index}`)} className={classes}></iframe>;
        const menuItems = bouys.map((item) => portraitButton(item));
        return menuItems;
    }

    return <div>
                <div className='width-100-percent h-scroll'>
                    {menu()}
                </div>
                <div className='containerBox button bg-lite'>
            <a className='color-neogreen' href="https://www.tide-forecast.com/tide/Bahia-de-Ballenas-Baja-California-Sur-Mexico/sea-conditions" target="_blank" rel="noopener noreferrer">
                        {icons.buoys} Bahia-de-Ballenas-Baja-California-Sur-Mexico
                    </a>
                </div>
            </div>
}
export default BuoysDisplay;