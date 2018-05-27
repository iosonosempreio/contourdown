d3.select('#contourdown')
    .style('width', '100%')
    .style('height', 0)
    .style('padding-bottom', 'calc(100% / 3)')
    .style('border', '1px solid #7D3C98')
    .style('border-radius', '3px')
    .style('overflow', 'hidden')

// d3.select('body').append('h1').attr('id', 'duration')

var color;
let run = true;

// parameters have been calculated for 768 px width responsive svg
let pointsAmount,
    pointsLetter = 40,
    bandwidth = 8;

let moveRandomly = 2;

let interval = 250;

let pathConfig = {
    string: 'string',
    x: -10,
    y: 0,
    fontSize: 180
}

opentype.load('fonts/WorkSans-Hairline.otf', function(err, font) {
    if (err) {
        alert('Font could not be loaded: ' + err);
    } else {

        let W = d3.select('#contourdown').node().getBoundingClientRect().width,
            H = d3.select('#contourdown').node().getBoundingClientRect().height;

        let w = 768,
            h = 768 / 3;

        amountBGpoints = h * 0.5;

        if (isMobileDevice()) {
            d3.select('body').style('background-color', '#FEF9E7')
            pointsLetter = 20;
            bandwidth = 8;
            amountBGpoints = h * 0.1;
            pathConfig.fontSize = 180;
            color.domain([0.008, 0])
            interval = 1000;
        }

        let string;
        var pathData;

        let svg = d3.select('#contourdown')
            .append('svg')
            .attr('viewBox', `0 0 ${w} ${h}`)
            .style('width', '100%')
            .style('height', 'auto')
            .style('background-color', '#F5EEF8')

        let g = svg.append('g')

        let counterText = g.append('path')
            .attr('class', 'outlined-texts')
            .style('opacity', 0)

        let contours = svg.insert("g", "g")
            .classed('contours-group', true)
            .attr("stroke-linejoin", "round")
            .selectAll("path")


        color = d3.scaleSequential()
            .domain([0.015, 0]) // Points per square pixel.
            .interpolator(d3.interpolateRainbow)

        var formatTime = d3.timeFormat("%H %M %S");
        let idleInterval = setInterval(timerIncrement, interval);

        timerIncrement();

        function timerIncrement(txt) {

            var date1 = new Date();

            let pointsData;

            if (run) {

                string = txt ? txt : formatTime(new Date);
                pathConfig.string = string;
                pointsAmount = string.length * pointsLetter;
                pathData = font.getPath(pathConfig.string, pathConfig.x, pathConfig.y, pathConfig.fontSize);
                pathData = pathData.toPathData();

                counterText.attr('d', pathData);

                let movex = (w - counterText.node().getBBox().width) / 2
                let movey = (h - counterText.node().getBBox().height) / 2 + counterText.node().getBBox().height

                // move into center
                counterText.attr('transform', `translate(${movex},${0})`)

                pointsData = [];

                for (i = 1; i <= pointsAmount; i++) {
                    let position = d3.select('.outlined-texts').node().getTotalLength() / pointsAmount * i;
                    let thisPoint = d3.selectAll('.outlined-texts').node().getPointAtLength(position);
                    thisPoint.id = i;

                    //adjust x and y according to movex and movey to be in ceter of svg
                    thisPoint.x += movex;
                    thisPoint.y += movey;

                    //push to array of points
                    pointsData.push(thisPoint);
                }

                pointsData = pointsData.map(function(d) {
                    return {
                        'x': d.x + d3.randomUniform(-moveRandomly, moveRandomly)(),
                        'y': d.y + d3.randomUniform(-moveRandomly, moveRandomly)(),
                        'id': d.id
                    }
                })

                for (i = 1; i < amountBGpoints; i++) {
                    let thisX = d3.randomUniform(0, w)();
                    let thisY = d3.randomUniform(0, h)()
                    let randomPoint = {
                        x: thisX,
                        y: thisY,
                        id: pointsAmount + i
                    }
                    pointsData.push(randomPoint);
                }

                contours = contours.data(d3.contourDensity()
                    .x(function(d) { return d.x; return x(d.x); })
                    .y(function(d) { return d.y; return y(d.y); })
                    .size([w, h])
                    .bandwidth(bandwidth)
                    (pointsData),
                    function(d) { return d.id; })

                contours.exit().remove();

                contours = contours.enter().append("path")
                    .classed('contour', true)
                    .style('stroke-width', 0.4)
                    .style('fill', 'none')
                    .merge(contours)
                    .attr("d", d3.geoPath())
                    .style("stroke", function(d) { return color(d.value); })
            }

            var date2 = new Date();
            var diff = date2 - date1; //milliseconds interval

            if (d3.select('#duration')) {
                d3.select('#duration').html(diff + ' - ' + pointsData.length);
            }
        }

    }
});

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};