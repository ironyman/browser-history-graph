// import * as d3 from "../node_modules/d3/dist/d3.js";

// chrome.runtime.sendMessage('get-recent-history', function (visits) {
//   console.log("response", visits.length);
// });


async function getHistory() {
  // let visits = await chrome.runtime.sendMessage('get-recent-history');
  // console.log("response", visits.length);
  return new Promise(resolve => {
    browser.runtime.sendMessage('get-recent-history', function (response) {
      // console.log("response", response[0].url);
      resolve(response);
    });
  });
}

async function setBackground() {
  let bg = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US')
    .then((response) => response.json())
    .then((data) => {
      // console.log(data.images[0].url);
      return data.images[0].url;
    });
  document.querySelector('body').style = `
  background-image: url(https://bing.com/${bg});
  width: 100%;
  height: 100vh;
  background-position: center;
  background-size: cover;
  `;
  // this.context.fillStyle = (window.matchMedia('(prefers-color-scheme: dark)').matches ? "#f2f3f4" : "#606368");
}

function urlToDomain(urlString) {
  if (!urlString ||
    urlString == "about:newtab" ||
    urlString == "about:blank" ||
    urlString.startsWith(document.location.href) ||
    urlString.startsWith(new URL(document.location.href).hostname)
  )
    return "Home";
  let url;
  try {
    url = new URL(urlString);
  } catch (e) {
    return urlString;
  }

  if (!url.hostname) {
    // Some urls look like this, not really url
    // a = new URL('view-source:moz-extension://6987f6c0-eb29-4563-99c6-4dc9e648dcdf/popup/dist/index.html')
    // URL { href: "view-source:moz-extension://6987f6c0-eb29-4563-99c6-4dc9e648dcdf/popup/dist/index.html",
    // origin: "moz-extension://6987f6c0-eb29-4563-99c6-4dc9e648dcdf", protocol: "view-source:", username: "",
    // password: "", host: "", hostname: "", port: "",
    // pathname: "moz-extension://6987f6c0-eb29-4563-99c6-4dc9e648dcdf/popup/dist/index.html", search: "" }
    return urlToDomain(url.pathname);
  }
  return url.hostname;
}

async function main() {
  setBackground();
  // let a = browser.runtime.getManifest();
  // for (let k of Object.keys(a)) {
  //   console.log(k, a[k]);
  // }
  let history = await getHistory();
  let nodesMap = {};
  let width = 640;
  let height = 480;
  let transform = { x: 0, y: 0, k: 1 };

  try {
    // compute nodes from links data
    history.forEach(function (visit) {
      // visit.source = nodesMap[visit.fromId] ||
      //   (nodesMap[visit.fromId] = { id: visit.fromId });
      // visit.target = nodesMap[visit.id] ||
      //   (nodesMap[visit.id] = { id: visit.id });
      let fromDomain = urlToDomain(visit.fromUrl);
      let domain = urlToDomain(visit.url);

      visit.source = nodesMap[fromDomain] ||
        (nodesMap[fromDomain] = { id: fromDomain, title: fromDomain, icon: `https://${fromDomain}/favicon.ico`, visitId: visit.id });
      visit.target = nodesMap[domain] ||
        (nodesMap[domain] = { id: domain, title: domain, icon: `https://${domain}/favicon.ico`, visitId: visit.id });
    });
    let nodes = Object.values(nodesMap);

    // add a SVG to the body for our viz
    var svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', function(event) {
        // console.log(event);
        if (!Number.isNaN(event.transform.x)) {
          transform.x = -event.transform.x;
        }
        if (!Number.isNaN(event.transform.y)) {
          transform.y = -event.transform.y;
        }
        // if (!Number.isNaN(event.transform.k)) {
        //   transform.k = event.transform.k;
        // }
        if (transform.k < 1) {
          transform.k = 1;
        } else if (transform.k > 1.2) {
          transform.k = 1.2;
        }

        // This is not the kind of pan we want, this moves the entire svg...
        // svg.attr("transform", event.transform);
        // svg.attr('transform', `translate(${event.transform.x}, ${event.transform.y}) scale(${event.transform.k})`);
      }));

    var simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(history));
      // .force("link", d3.forceLink().id(function (d) { return d.id; }));
      // .force("charge", null)

    var link = svg.append("g")
      .style("stroke", "#aaa")
      .selectAll("line")
      .data(history)
      .enter().append("line");

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      // Title doesn't actually display on hover for circle.. just look at source
      // .attr('title', d => d.visitId)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    var favicon = svg.append("g")
      .attr("class", "favicon")
      .selectAll("image")
      .data(nodes)
      .enter().append("image")
      .attr('width', 24)
      .attr('height', 24)
      .attr('title', d => d.visitId)
      .attr("xlink:href", function(d) {
        return d.icon;
      })


    var label = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .style("font", "arial")
      .style("font-size", "12px")
      .attr("class", "label")
      .text(function (d) { return d.title; });

    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(history);

  } catch (e) {
    console.log("d3", e.toString());
  }
  function dragstarted(event, d) {
    try {
      if (!event.active)
        simulation.alphaTarget(0.3).restart()
      d.fx = event.x;
      d.fy = event.y;
    } catch (e) {
      console.log("d3", e.toString());
    }

  }

  function dragged(event, d) {
    try {
      // simulation.alphaTarget(0.3).restart();
      d.fx = event.x;
      d.fy = event.y;
    } catch (e) {
      console.log("d3", e.toString());
    }
  }

  function dragended(event, d) {
    try {
      if (!event.active) simulation.alphaTarget(0);
      delete d.fx;
      delete d.fy;
    } catch (e) {
      console.log("d3", e.toString());
    }
  }


  function ticked() {
    link
      .attr("x1", function (d) { return transform.k*(d.source.x - transform.x); })
      .attr("y1", function (d) { return transform.k*(d.source.y - transform.y); })
      .attr("x2", function (d) { return transform.k*(d.target.x - transform.x); })
      .attr("y2", function (d) { return transform.k*(d.target.y - transform.y); });

    node
      .attr("r", 20)
      .style("fill", "#d9d9d9")
      .style("stroke", "#969696")
      .style("stroke-width", "1px")
      .attr("cx", function (d) { return transform.k*(d.x - transform.x); })
      .attr("cy", function (d) { return transform.k*(d.y - transform.y); });

    label
      .attr("x", function (d) { return transform.k*(d.x - transform.x); })
      .attr("y", function (d) { return transform.k*(d.y - transform.y); })
      .style("font-size", "20px").style("fill", "#4393c3");

    // offset by half of width and height
    favicon
      .attr("x", function (d) { return transform.k*(d.x-12  - transform.x); })
      .attr("y", function (d) { return transform.k*(d.y-12  - transform.y); });
  }

  //   var force = d3.layout.force() //build the layout
  //       .size([width, height]) //specified earlier
  //       .nodes(d3.values(nodes)) //add nodes
  //       .links(links) //add links
  //       .on("tick", tick) //what to do
  //       .linkDistance(300) //set for proper svg size
  //       .start(); //kick the party off!

  //           // add the links
  //     var link = svg.selectAll('.link')
  //     .data(links)
  //     .enter().append('line')
  //     .attr('class', 'link');

  // // add the nodes
  // var node = svg.selectAll('.node')
  //     .data(force.nodes()) //add
  //     .enter().append('circle')
  //     .attr('class', 'node')
  //     .attr('r', width * 0.03); //radius of circle

  //     function tick(e) {

  //       node.attr('cx', function(d) { return d.x; })
  //           .attr('cy', function(d) { return d.y; })
  //           .call(force.drag);

  //       link.attr('x1', function(d) { return d.source.x; })
  //           .attr('y1', function(d) { return d.source.y; })
  //           .attr('x2', function(d) { return d.target.x; })
  //           .attr('y2', function(d) { return d.target.y; });

  //   }
}

main();