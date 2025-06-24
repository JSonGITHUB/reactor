const report = <div className='containerBox'>
    <link href='//www.surf-forecast.com/stylesheets/widget.css' media='screen' rel='stylesheet' type='text/css' />
    <div class='wf-width-cont surf-fc-widget widget-centered'>
        <div class='widget-container'>
            <div class='external-cont'>
                <iframe class='surf-fc-i' allowtransparency='true' src='//www.surf-forecast.com/breaks/Punta-Abreojos/forecasts/widget/i' scrolling='yes' frameborder='0' marginwidth='0' marginheight='0'>
                </iframe>
                <div class='footer'>
                    <a class='logo' href='//www.surf-forecast.com/'>
                        <img src='//www.surf-forecast.com/images/widget.png' width='1' height='1' />
                    </a>
                    <div class='about' id='cmt'>
                        View detailed surf forecast for <a href='//www.surf-forecast.com/breaks/Punta-Abreojos'>Punta Abreojos</a>. Visit <a href='//www.surf-forecast.com/breaks/Punta-Abreojos'>surf-forecast.com</a> for more details, long range forecasts, surf reports, swell and weather maps.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
export default report;