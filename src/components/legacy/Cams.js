function showCams() {
    var camPrefix = '<iframe width="234" height="132" src="http://e.cdn-surfline.com/syndication/embed/v1/player.html?id=';
    var camSuffix = '" frameborder="0" scrolling="no" allowfullscreen></iframe>';
    var x=0;
    var cams = [
        4786,
        4241,
        68366,
        4242,
        128083,
        4773,
        4771,
        4772,
        4789,
        4790,
        4791,
        4238,
        139590,
        139591,
        4787,
        139340,
        4783,
        4246,
        4812,
        4248,
        4252,
        4253,
        4254
    ]
//    document.getElementById("resume").style.opacity = 0;
//    document.getElementById("resume").innerHTML = "";
    for (x in cams) {
        document.getElementById("resume").innerHTML = document.getElementById("resume").innerHTML +
        camPrefix + cams[x] + camSuffix;
    }
//    document.getElementById("resume").innerHTML = '<iframe width="280" height="158" src="http://e.cdn-surfline.com/syndication/embed/v1/player.html?id=4786" frameborder="0" scrolling="no" allowfullscreen></iframe><iframe width="280" height="158" src="http://e.cdn-surfline.com/syndication/embed/v1/player.html?id=4238" frameborder="0" scrolling="no" allowfullscreen></iframe>';
    document.getElementById("resume").style.opacity = 1;
    document.getElementById("resume").className = "columns";
    document.getElementById("resume").scrollTop = 0;
    document.getElementById("resume").scrollLeft = 0;
    resize();   
}