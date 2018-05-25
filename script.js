// const toPoints = SVGPoints.toPoints
// const toPath = SVGPoints.toPath

opentype.load('fonts/WorkSans-Hairline.otf', function(err, font) {
    if (err) {
        alert('Font could not be loaded: ' + err);
    } else {

        let w = 500,
            h = 500;

        let svg = d3.select('#contourdown').append('svg')
            .attr('width', w)
            .attr('height', h)
            .style('background-color', '#e4e4e4')

        let g = svg.append('g').attr('transform', `translate(0,${h/2 - 0})`)

        g.append('path')
            .attr('class', 'outlined-texts')
            .attr('fill', 'red')
            .style('display', 'none')

        let points = g.selectAll('.points');



        // // Get points with svg-points
        // removed
        // let pathObj = {
        //     type: 'path',
        //     d: pathData
        // }
        // let pointsData = toPoints(pathObj);


        let width = w,
            height = h,
            margin = { top: 0, right: 0, bottom: 0, left: 0 };

        var x = d3.scaleLinear()
            .domain([0, 500])
            .range([margin.left, width - margin.right]);

        var y = d3.scaleLinear()
            .domain([500, 0])
            .range([height - margin.bottom, margin.top]);

        var color = d3.scaleSequential(d3.interpolateYlGnBu)
            .domain([0, 0.05]); // Points per square pixel.

        let contours = svg.insert("g", "g")
            .classed('contours-group', true)
            // .attr("stroke-linejoin", "round")
            .selectAll("path")

        var formatTime = d3.timeFormat("%H %M %S");
        // formatTime(new Date); // "June 30, 2015"

        let string = formatTime(new Date);

        let idleInterval = setInterval(timerIncrement, 1000);

        timerIncrement();

        function timerIncrement() {
            string = formatTime(new Date);
            // console.log(string);
            var pathData = font.getPath(string, 25, 150, 120);
            pathData = pathData.toPathData();
            d3.select('.outlined-texts')
                // .transition()
                // .duration(500)
                .attr('d', pathData);

            let pointsData = [];

            for (i = 1; i <= 500; i++) {
                // console.log(i)
                let position = d3.select('.outlined-texts').node().getTotalLength() / 500 * i;
                let thisPoint = d3.selectAll('.outlined-texts').node().getPointAtLength(position);
                // console.log(thisPoint);
                thisPoint.id = i;
                pointsData.push(thisPoint);
            }

            pointsData = pointsData.map(function(d) {
                return {
                    'x': d.x,
                    'y': d.y,
                    'id': d.id
                }
            })

            // for (i = 1; i <= 350; i++) {
            // 	let thisX = d3.randomUniform(0, w)();
            // 	let thisY = d3.randomUniform(0, h)()
            //     let randomPoint = {
            //         x: thisX,
            //         y: thisY,
            //         id: 500 + i
            //     }
            //     pointsData.push(randomPoint);
            // }

            // console.log(pointsData)

            // points = points.data(pointsData, function(d) { return d.id; })

            // points.exit().remove();

            // points = points.enter().append('circle').classed('points', true)
            //     .attr('fill', 'grey')
            //     .attr('r', 1)
            //     .style('opacity',1)
            //     .merge(points)
            //     .attr('cx', function(d) { return d.x })
            //     .attr('cy', function(d) { return d.y })

            contours = contours.data(d3.contourDensity()
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); })
                .size([width, height])
                .bandwidth(5)
                (pointsData), function(d){return d.id;})

            contours.exit().remove();

            contours = contours.enter().append("path")
                .merge(contours)
                .classed('shown', true)
                .attr("d", d3.geoPath())
                .attr("fill", function(d) { return color(d.value); })

            // contours.transition()
            // .duration(500)
            // .attr("d", d3.geoPath())

        }

    }
});