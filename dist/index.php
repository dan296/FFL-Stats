<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>ESPN Fantasy Football Stats</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css'>
<link rel="stylesheet" href="./style.css?v=<?php echo rand() ?>">
<meta name="viewport" content="initial-scale = 1.0,maximum-scale = 1.0" />
<link rel="icon" type="image/png" href="/imgs/logo.png">
<link rel="prefetch" as="image" href="/imgs/title.png">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5560789937276053"
     crossorigin="anonymous"></script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RDCS4GET7L"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-RDCS4GET7L');
</script>
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
  <script>
  $( function() {
    $( document ).tooltip();
  } );
  </script>
</head>
<body>
<div id="header">
    <img src="/imgs/title.png?v=<?php echo rand() ?>"/>
</div>
<div id="idSubWrap">
    <p><strong>Enter a League ID:</strong></p>
    <p style="font-size: 8pt;">
        <em>Your ESPN League ID can be found in the URL of your league's home page</em><br/>
        <span style="color:gray">https://fantasy.espn.com/football/league?leagueId=<span style="background-color: #646464; color: white;">######</span></span>
    </p>
    <input type="number" placeholder="######" /><br/>
    <button id="idSubmit">Submit</button>
    <div id="inv-id">Invalid League ID</div>
</div>
<div id="main">
<div id="shareWrap" title="share"><i class="fa-solid fa-share-from-square"></i></div>
<div id="link-copied">Link Copied!</div>
<div id='chart-wrap'>
    <div id="sel-wrap">
  <div id="stat-selector" class="dropdown-selector">
    <input type="hidden" id="stat" value="pts"></input>
    <div id="curr-selected-stat" class="curr-selected-item">Points For/Against</div>
    <div class="dropdown">
      <div class="dropdown-item" data-val="pts" style="display:none;">Points For/Against</div>
      <div class="dropdown-item" data-val="wins">Wins/Losses</div>
      <div class="dropdown-item" data-val="fab">FAB Spent</div>
      <div class="dropdown-item" data-val="playoffs">Playoff Appearances</div>
      <div class="dropdown-item" data-val="winPct">Win Percentage</div>
      <div class="dropdown-item" data-val="draft">Draft Order</div>
      <div class="dropdown-item" data-val="rank">Rank</div>
      <div class="dropdown-item" data-val="injuries">IR Moves</div>
      <div class="dropdown-item" data-val="trades">Trades</div>
      <div class="dropdown-item" data-val="lineup">Lineup Edits</div>
      <div class="dropdown-item" data-val="acqs">Acquisitions</div>
      <!--<div class="dropdown-item" data-val="scorer">Highest Scorer</div>-->
      <div class="dropdown-item" data-val="reg_wins">Regular Season Wins/Losses</div>
      <div class="dropdown-item" data-val="playoff_wins">Playoff Wins/Losses</div>
      <div class="dropdown-item" data-val="championship_wins">Championship Wins/Losses</div>
    </div>
  </div>
  <div id="mem-selector" class="dropdown-selector">
    <input type="hidden" id="memberVal" value="pts"></input>
    <div id="curr-selected-member" class="curr-selected-item">Points For/Against</div>
    <div class="dropdown">
    </div>
  </div>
<div class="secondary-selector" id="cum-avg-selector">
    <div class="secondary-select secondary-selected">
      Cumululative
    </div>
  <div class="secondary-select">
      Average
    </div>
  </div>
<div class="secondary-selector" id="pts-selector">
    <div class="secondary-select secondary-selected">
      For
    </div>
  <div class="secondary-select">
      Against
    </div>
  </div>
<div class="secondary-selector" id="wins-selector">
    <div class="secondary-select secondary-selected">
      Wins
    </div>
  <div class="secondary-select">
      Losses
    </div>
  <div class="secondary-select">
      Ties
    </div>
  </div>
<div class="secondary-selector" id="acqs-selector">
    <div class="secondary-select secondary-selected">
      Picks
    </div>
  <div class="secondary-select">
      Drops
    </div>
  </div>
<div class="secondary-selector" id="rank-selector">
    <div class="secondary-select secondary-selected">
      Final
    </div>
  <div class="secondary-select">
      Projected
    </div>
  <div class="secondary-select">
      Differential
    </div>
  </div>
  <div class="secondary-selector" id="h2h-selector" style="width: 300px;">
    <div class="secondary-select secondary-selected">
      All
    </div>
  <div class="secondary-select">
      Regular Season
    </div>
    <div class="secondary-select">
      Playoffs
    </div>
    <div class="secondary-select">
      Championship
    </div>
  </div>
  <div id="chart-selector">
    <div class="chart-select">
      <i class="fa-regular fa-chart-bar"></i>
    </div>
    <div class="chart-select">
      <i class="fa-solid fa-chart-line"></i>
    </div>
    <div class="chart-select">
       <i class="fa-solid fa-chart-pie"></i>
    </div>
    <div class="chart-select">
      <i class="fa-solid fa-table-cells"></i>
    </div>
  </div>
  </div>
<canvas id="compChart" width="100px" height="50px"></canvas>
  <canvas id="histChart" width="100px" height="50px"></canvas>
<canvas id="pieChart" width="100px" height="50px"></canvas>
<br/>
<div id="tableView">
    <div class="freeze-table">
        <div class="col frozen-col">
            <div class="col-head">Opponent</div>
            <div class="col-mems">
            </div>
        </div>
        <div class="other-cols-wrap">
            <div class="col">
                <div class="col-head">Record (W-L-T)</div>
                <div class="col-stats">
                </div>
            </div>
            <div class="col">
                <div class="col-head">Win %</div>
                <div class="col-stats">
                </div>
            </div>
            <div class="col">
                <div class="col-head">Points For</div>
                <div class="col-stats">
                </div>
            </div>
            <div class="col">
                <div class="col-head">Points Against</div>
                <div class="col-stats" style="border-top-right-radius: 5px; overflow: hidden; border-bottom-right-radius: 5px;">
                </div>
            </div>
        </div>
        
    </div>
</div>
</div>
<div id="navBtnWrap" title="menu"><i class="fa-solid fa-football"></i></div>
<div id="chartFilters">
  <div style="min-height: calc(100vh - 38px);">
  <div id="closeFiltersWrap"><div id="closeFilters"></div></div>
  <section id="teamFilters">
    <div class="sectionTitle">Teams</div> <span class="allSelector deselectAll">Deselect All</span>
    <div class="filterContainer">
    </div>
  </section>
  <section id="memberFilters">
    <div class="sectionTitle">Members</div> <span class="allSelector deselectAll">Deselect All</span>
    <div class="filterContainer">
    </div>
  </section>
  <section id="sznFilters">
    <div class="sectionTitle">Season</div> <span class="allSelector deselectAll">Deselect All</span>
    <div class="filterContainer">
    </div>
  </section>
  <section id="quickLnx">
    <div><u>Quick Links</u></div>
  </section>
  <section style="text-align: center;">
    <a href="https://www.fflstats.com">View a different league?</a>
  </section>
</div>
  <section id="version">
    <div><u><a target="_blank" href="https://github.com/dan296/FFL-Stats" style="position: relative; left: -10px;"><i class="fa-brands fa-github" style="margin-right: 5px; font-size: 10pt;"></i>v1.0.0</a></u></div>
  </section>
</div>
</div>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'></script>
<script  src="./script.js?v=<?php echo rand()?>"></script>
</body>
</html>
