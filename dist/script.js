///// INITIALIZING ALL VARIABLES
// 1139507
// 461628
// USING Today's Date to get year:
var today = new Date();
var year = today.getFullYear();
// Quick Links
var quickLnx = []

var allDataLoaded = false;

// getting league ID
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var lID = urlParams.get('id');

var barChart = {};
var barDataSets = [];

var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
//colorArray = colorArray.map(i => i+'8a');
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
colorArray = shuffle(colorArray);


var histChart = {};
var histDataSets = [];

var pieChart = {};
var pieDataSet = [];

//Main Object
var league = {
  id: lID,
  birthYr: 2000,
  mostRecentDraftYr: 2000,
  in_season: false,
  season_lengths: [],
  members: {},
  teams: {}
}


function getLeague(id){
    league.id = id;
    $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+id+"?view=mStatus&seasonId=", function(data) {
        //On Success do something.
        console.log('proceed...');
        //var url = new URL();
        //url.searchParams.set("id", id); // setting your param
        //var newUrl = url.href; 
        
        $('#idSubWrap').fadeOut();
        getDraftStatus(year);
        getMembersAndTeams();
        getFilteredArrays();
        $('#main').fadeIn();
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
            //alert("404 Not Found");
        } else {
            //alert("Other non-handled error type");
        }
        $('#idSubWrap').show();
        if(lID == null || lID == undefined){
        }else{
            $('#inv-id').fadeIn(200);
            $('#inv-id').delay(2200).fadeOut(200);
        }
        
        console.log('nah boii');
    });
}

getLeague(lID);

$('#idSubmit').click(function(){
    lID = $('#idSubWrap input').val();
    //getLeague(lID);
    window.location.href = 'https://fflstats.com?id='+lID;
})

$('#idSubWrap input').keypress(function(e){
     var code = e.keyCode || e.which;
     if(code == 13) { 
       $('#idSubmit').click();
     }
    
})

$('#shareWrap').click(function(){
    var shareData = {
      title: 'ESPN Fantasy Football League Stats',
      text: "View your league's history stats!",
      url: window.location.href
    }
    if(navigator.share){
        navigator.share(shareData)
    }
    
    navigator.clipboard.writeText(window.location.href);
    $('#link-copied').fadeIn(200);
    $('#link-copied').delay(2000).fadeOut(200);
      
})

function checkIdValid(id){
    var result = false;
    $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+id+"?view=mStatus&seasonId=", function(data) {
    //On Success do something.
    result = true;
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
            //alert("404 Not Found");
        } else {
            //alert("Other non-handled error type");
        }
        result = false;
    });
    return result;
}




function getDraftStatus(yr){
  $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mStatus&seasonId="+yr, function(result){
    league.in_season = result[0].draftDetail.inProgress;
    if(result[0].draftDetail.drafted == true){
      league.mostRecentDraftYr = yr;
    } else {
      league.mostRecentDraftYr = yr - 1;
    }
    
    quickLnx = [
      {
        link: "https://fantasy.espn.com/football/league/draftrecap?leagueId="+league.id+"&seasonId="+league.mostRecentDraftYr,
        title: "Draft",
        label: "<i class='fa-solid fa-arrow-up-right-from-square'></i> Latest Draft"
      }
    ]
    
    if(lID == "461628"){
        quickLnx.push(
            {
                link: "http://wins.araincloud.com/",
                title: "Wins Pool",
                label: "<i class='fa-solid fa-arrow-up-right-from-square'></i> Wins Pool"
              },
              {
                link: "https://docs.google.com/spreadsheets/d/1K2_qeAE0E0XNzEdJ1_XiOIyolVVCsZYwpjcz-LftGDQ/edit",
                title: "Keepers",
                label: "<i class='fa-solid fa-arrow-up-right-from-square'></i> Keepers"
              }
            )
    }
    
    $.each(quickLnx, function(i,x){
      $("#quickLnx").append(
        "<a href='"+ x.link +"' target='_blank' title='"+ x.title +"'>"+ x.label + "</a><br/>"
      );
    });
    
  }).fail(function() { 
    getDraftStatus(yr-1);
  })
}

function getMembersAndTeams(){
  $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mTeam", function(result){
    
    league.birthYr = result[0].seasonId;
    var memberIds = [];
    var teamIds = [];
    var activeSeasons = result.filter(tres => tres.status.isFull);
    var numActSzns = activeSeasons.length;
    //console.log(numActiveSeasons.length);
    $.each(result, function(i,x){
        console.log(result[i].status.isFull == false);
        if(result[i].status.isFull){
             league.season_lengths.push(parseInt(result[i].scoringPeriodId));
        }
        if(result[result.length-i-1].status.isFull){
            $('#sznFilters .filterContainer').append('<div class="filterWrap"><input type="checkbox" checked> <div class="filterLabel">'+result[result.length-i-1].seasonId+'</div></div>');
        }
     
      $.each(x.members, function(j,member){
        
        if(memberIds.indexOf(member.id) == -1){
          memberIds.push(member.id);
          league.members[member.id] = member;

          if(j==0){
              $('#memberVal').prop('value',member.id);
              $('#curr-selected-member').html(member.firstName+' <span class="dispname">('+member.displayName+')</span>');
          }
          
          $('#memberFilters .filterContainer').append('<div class="filterWrap"><input type="checkbox" checked data-member-id="'+member.id+'"> <div class="filterLabel">'+member.firstName+' <span class="dispname">('+member.displayName+')</span>'+'</div></div>');
          $('#mem-selector .dropdown').append('<div class="dropdown-item" data-val="'+member.id+'" style="display:none;">'+member.firstName+' <span class="dispname">('+member.displayName+')</span></div>');
        }
      })
      
      
      
      $.each(x.teams, function(j,team){
        if(teamIds.indexOf(team.id) == -1){
          teamIds.push(team.id);
          league.teams[team.id] = {
            id: team.id,
            names: new Array(numActSzns),
            abbrevs: new Array(numActSzns),
            all_scores: new Array(numActSzns),
            all_ranks: new Array(numActSzns),
            trades:new Array(numActSzns),
            lineup_edits: new Array(numActSzns),
            moveToIR: new Array(numActSzns),
            all_acqs: new Array(numActSzns),
            draft_positions: new Array(numActSzns),
            all_rosters: new Array(numActSzns),
            owners: new Array(numActSzns),
            logos: new Array(numActSzns),
            wins: new Array(numActSzns),
            losses: new Array(numActSzns),
            ties: new Array(numActSzns),
            reg_wins: new Array(numActSzns).fill(0),
            reg_losses: new Array(numActSzns).fill(0),
            reg_ties: new Array(numActSzns).fill(0),
            playoff_wins: new Array(numActSzns).fill(0),
            playoff_losses: new Array(numActSzns).fill(0),
            playoff_ties: new Array(numActSzns).fill(0),
            championship_wins: new Array(numActSzns).fill(0),
            championship_losses: new Array(numActSzns).fill(0),
            championship_ties: new Array(numActSzns).fill(0),
            ptsFor: new Array(numActSzns),
            ptsAgainst: new Array(numActSzns),
            streakLength: new Array(numActSzns),
            streakType: new Array(numActSzns),
            winPct: new Array(numActSzns),
            szns: new Array(numActSzns)
          }
        }
        if(result[i].status.isFull){
        league.teams[team.id].names[i] = team.location +" "+ team.nickname;
        league.teams[team.id].abbrevs[i] = team.abbrev;
        league.teams[team.id].owners[i] = team.owners;
        league.teams[team.id].logos[i] = team.logo;
        league.teams[team.id].szns[i] = x.seasonId;
        league.teams[team.id].all_acqs[i] = 
          {
            acqs: team.transactionCounter.matchupAcquisitionTotals,
            total_acqs: team.transactionCounter.acquisitions,
            total_drops: team.transactionCounter.drops,
            f_agent: [],
            waiver: [],
            fab_spent: team.transactionCounter.acquisitionBudgetSpent
          };
        
        
        league.teams[team.id].all_ranks[i] = 
          {
            projected: (team.draftDayProjectedRank > 0) ? team.draftDayProjectedRank : null,
            final: (team.rankCalculatedFinal > 0) ? team.rankCalculatedFinal : null,
            diff: (team.draftDayProjectedRank > 0) ? (team.draftDayProjectedRank - team.rankCalculatedFinal) : null
          };
        
        league.teams[team.id].trades[i] = team.transactionCounter.trades;
        league.teams[team.id].lineup_edits[i] = team.transactionCounter.moveToActive;
        league.teams[team.id].moveToIR[i] = team.transactionCounter.moveToIR;
        league.teams[team.id].wins[i] = team.record.overall.wins;
        league.teams[team.id].losses[i] = team.record.overall.losses;
        league.teams[team.id].ties[i] = team.record.overall.ties;
        league.teams[team.id].ptsFor[i] = Math.round(team.record.overall.pointsFor*100)/100;
        league.teams[team.id].ptsAgainst[i] = Math.round(team.record.overall.pointsAgainst*100)/100;
        league.teams[team.id].streakLength[i] = team.record.overall.streakLength;
        league.teams[team.id].streakType[i] = team.record.overall.streakType;
        league.teams[team.id].winPct[i] = Math.round(team.record.overall.percentage*10000)/10000;
        }
        
      })
      if(i == result.length - 1){
        getTeamStats();
      }
    })
    
    $('.dropdown-item').click(function(){
          $(this).parent().parent().children().eq(1).html($(this).html());
          $(this).parent().parent().children().eq(0).prop('value',$(this).attr('data-val'));
          getFilteredArrays();
        })
  });
}


function getTeamStats(){
  $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mMatchupScore", function(result){
    $.each(result, function(i,res){
        if(res.status.isFull){
      $.each(league.teams, function(j,tm){
        
        tm.all_scores[i] =
          {
                scores: [],
                against: [],
                against_score: [],
                is_playoff: [],
              };
        tm.all_rosters[i]=
          {
            roster: []
          };
      })
      $.each(res.schedule, function(j, sched){
        //console.log(res.length);
        //console.log(res);
        //console.log(res.schedule);
        //var btn = [];
        //btn.html('debug');
        // AWAY is undefined on bye weeks!!
        //console.log(sched.length);
        var homeTeam = sched.home; 
        var awayTeam = {teamId: "-1", totalPoints: 0}
        if(sched.away !== undefined){
          awayTeam = sched.away;
        } 
    //Filling out home team
        if(league.teams[homeTeam.teamId].all_scores[i] !== undefined){
          league.teams[homeTeam.teamId].all_scores[i].scores.push(homeTeam.totalPoints);
         league.teams[homeTeam.teamId].all_scores[i].against.push(awayTeam.teamId);
         league.teams[homeTeam.teamId].all_scores[i].against_score.push(awayTeam.totalPoints);
        }

          //Filling out away team
        if(awayTeam.teamId !== "-1"){
          if(league.teams[awayTeam.teamId].all_scores[i] !== undefined){
           league.teams[awayTeam.teamId].all_scores[i].scores.push(awayTeam.totalPoints);
           league.teams[awayTeam.teamId].all_scores[i].against.push(homeTeam.teamId);
           league.teams[awayTeam.teamId].all_scores[i].against_score.push(homeTeam.totalPoints);
          }
        }
         

          // Filling out is_playoff
          if(sched.playoffTierType == "WINNERS_BRACKET"){
            if(league.teams[homeTeam.teamId].all_scores[i] !== undefined){
              league.teams[homeTeam.teamId].all_scores[i].is_playoff.push(1);
            }
            if(awayTeam.teamId !== "-1"){
              if(league.teams[awayTeam.teamId].all_scores[i] !== undefined){
                league.teams[awayTeam.teamId].all_scores[i].is_playoff.push(1);
              }
            }
            
            var isChampionship = (parseInt(sched.matchupPeriodId) == league.season_lengths[i]);
            
            if(sched.winner == "HOME"){
              if(league.teams[homeTeam.teamId].playoff_wins[i] == undefined){
                league.teams[homeTeam.teamId].playoff_wins[i] = 0;
              }
              league.teams[homeTeam.teamId].playoff_wins[i]++;
              
              if(league.teams[awayTeam.teamId].playoff_losses[i] == undefined){
                league.teams[awayTeam.teamId].playoff_losses[i] = 0;
              }
              league.teams[awayTeam.teamId].playoff_losses[i]++;
              
              if(isChampionship){
                league.teams[homeTeam.teamId].championship_wins[i] = 1;
                league.teams[awayTeam.teamId].championship_losses[i] = 1;
              }
              
            }else if(sched.winner == "AWAY"){
              if(league.teams[awayTeam.teamId].playoff_wins[i] == undefined){
                league.teams[awayTeam.teamId].playoff_wins[i] = 0;
              }
              league.teams[awayTeam.teamId].playoff_wins[i]++;
              if(league.teams[homeTeam.teamId].playoff_losses[i] == undefined){
                league.teams[homeTeam.teamId].playoff_losses[i] = 0;
              }
              league.teams[homeTeam.teamId].playoff_losses[i]++;
              
              if(isChampionship){
                league.teams[awayTeam.teamId].championship_wins[i] = 1;
                league.teams[homeTeam.teamId].championship_losses[i] = 1;
              }
              
            }else if(sched.winner == "TIE"){
              if(league.teams[awayTeam.teamId].playoff_ties[i] == undefined){
                league.teams[awayTeam.teamId].playoff_ties[i] = 0;
              }
              league.teams[awayTeam.teamId].playoff_ties[i]++;
              if(league.teams[homeTeam.teamId].playoff_ties[i] == undefined){
                league.teams[homeTeam.teamId].playoff_ties[i] = 0;
              }
              league.teams[homeTeam.teamId].playoff_ties[i]++;
              
              if(isChampionship){
                league.teams[awayTeam.teamId].championship_ties[i] = 1;
                league.teams[homeTeam.teamId].championship_ties[i] = 1;
              }
              
            }
          }else{
            if(league.teams[homeTeam.teamId].all_scores[i] !== undefined){
              league.teams[homeTeam.teamId].all_scores[i].is_playoff.push(0);
            }
            if(awayTeam.teamId !== "-1"){
              if(league.teams[awayTeam.teamId].all_scores[i] !== undefined){
                league.teams[awayTeam.teamId].all_scores[i].is_playoff.push(0);
              }
            }
            
            if(sched.winner == "HOME"){
              if(league.teams[homeTeam.teamId].reg_wins[i] == undefined){
                league.teams[homeTeam.teamId].reg_wins[i] = 0;
              }
              league.teams[homeTeam.teamId].reg_wins[i]++;
              
              if(league.teams[awayTeam.teamId].reg_losses[i] == undefined){
                league.teams[awayTeam.teamId].reg_losses[i] = 0;
              }
              league.teams[awayTeam.teamId].reg_losses[i]++;
              
            }else if(sched.winner == "AWAY"){
              if(league.teams[awayTeam.teamId].reg_wins[i] == undefined){
                league.teams[awayTeam.teamId].reg_wins[i] = 0;
              }
              league.teams[awayTeam.teamId].reg_wins[i]++;
              if(league.teams[homeTeam.teamId].reg_losses[i] == undefined){
                league.teams[homeTeam.teamId].reg_losses[i] = 0;
              }
              league.teams[homeTeam.teamId].reg_losses[i]++;
            }else if(sched.winner == "TIE"){
              if(league.teams[awayTeam.teamId].reg_ties[i] == undefined){
                league.teams[awayTeam.teamId].reg_ties[i] = 0;
              }
              league.teams[awayTeam.teamId].reg_ties[i]++;
              if(league.teams[homeTeam.teamId].reg_ties[i] == undefined){
                league.teams[homeTeam.teamId].reg_ties[i] = 0;
              }
              league.teams[homeTeam.teamId].reg_ties[i]++;
            }
            
            
          }
      
      })
        }
    
      if(i == result.length - 1){
        getDraftOrder();
        getPlayers();
      }
    })
    var teamNames = new Array(Object.keys(league.teams).length);
    for(var l = 0; l < league.season_lengths.length; l++){
      $.each(league.teams, function(i, tm){
        if(tm.names[l] !== undefined){
          teamNames[i-1] = tm.names[l];
        }
      })
    }
    console.log(teamNames);
    $.each(teamNames, function(i, name){
      $('#teamFilters .filterContainer').append('<div class="filterWrap"><input type="checkbox" checked> <div class="filterLabel" data-id="'+(i+1)+'">'+name+'</div></div>');
    })
    
    
    // FILTER FUNCTION
    $('.filterWrap input').on("click", function(){ 
      getFilteredArrays();
    })
  })
  
}

function getDraftOrder() {
   $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mDraftDetail", function(result){
     $.each(result, function(i, draft){
      $.each(draft.draftDetail.picks, function(j, pick){
        if(pick.roundId == 1){
          league.teams[pick.teamId].draft_positions[i]=pick.id;
        }
      })
    })
     
   })
}

function getPlayers() {
   $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mRoster", function(result){
     $.each(result, function(i, year){
      $.each(year.teams, function(j, team){
          if(team.roster !== undefined){
              
        $.each(team.roster.entries, function(k, player){
            if(player.playerPoolEntry !== null){
              var teamId = player.playerPoolEntry.onTeamId;
              if(teamId !== 0){
                if(league.teams[teamId].all_rosters[i] !== undefined){
                  league.teams[teamId].all_rosters[i].roster.push(
                  {
                    player: player.playerPoolEntry.player.fullName,
                    playerId: player.playerId,
                    injured: player.playerPoolEntry.player.injured
                  }
                  ); 
                }
              }
            }
        })
          }
      })
       if(i==result.length - 1){
         allDataLoaded = true;
         $('.chart-select').eq(0).click();
       }
    })
     
   })
}

function getPlayerStats(){
  $.getJSON("https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mBoxscore", function(result){
    console.log(result[4]);
    /*$.each(result, function(i, year){
      $.each(year.schedule, function(j, matchup){
      
      })
    })*/
  })
}

//getDraftStatus(year);
//getMembersAndTeams()




//Stats we care about:
/*
#1: Wins
#2: Playoff Runs (instances and streak)
#3: Individual Matchup Records
#4: Prediction Rank difference from beginning to end of season (+/-%)
#5: Play video for each season of rank
#6: Number of trades vetoed (Trades and trades vetod)
#7: Number of acquisitions (Free Agent, Waiver)
#8: Draft Position (Over years should be averaged)
#9: Individual Highest scorer for team (Years had them)
#10: Longest Streaks (winning and Losing)
*/

//https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mMatchupScore&view=mStatus&view=mSettings&view=mTeam&view=modular&view=mNav&seasonId=2017

// https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/"+league.id+"?view=mTeam


// League Evolution Stats:
/*
#1: Settings changed
*/


/*
QUICK LINKS:
Link to Wins Pool
Link to Keepers Sheet
Link to last Draft
*/
// Getting most recent draft based on Sept. 10th of each year

//var draftLim = new Date(today.getFullYear() + "-09-10");
//var mostRecentDraftYr = (draftLim < today.getTime()) ? today.getFullYear() : (today.getFullYear() - 1);


// SUPER USEFUL RESOURCE: https://cran.r-project.org/web/packages/ffscrapr/vignettes/espn_getendpoint.html

//MasterDataCompiler
function dataMod(teams, members, szns, stat, memberIDs){
  var teamNames = new Array(Object.keys(league.teams).length);
  var memberNames = new Array(Object.keys(league.teams).length);
  
  console.log(members);
  
  var ptsFor =[];
  var ptsAgainst = [];
  var avgPtsFor = [];
  var avgPtsAgainst = [];
  var wins = [];
  var losses = [];
  var avgWins =[];
  var avgLosses = [];
  histDataSets = [];
  var bdata1 = [];
  var blabel1 = "";
  var bdata2 = [];
  var blabel2 = "";
  var bdata3 = [];
  var blabel3 = "";
  var hdata = [];
  var numDataSets = 3;
  var transparent = false;
  var blue = '#5f7ff5';
  var red = '#db4c4c';
  var randColArr = new Array(Object.keys(league.teams).length);
  
  var showCumAvgSel = $('.chart-select').eq(0).hasClass('chart-selected') || $('.chart-select').eq(2).hasClass('chart-selected');
  var isCum = $('#cum-avg-selector .secondary-select').eq(0).hasClass('secondary-selected');
  
  var showH2HSel = $('.chart-select').eq(3).hasClass('chart-selected');
  var isAll = $('#h2h-selector .secondary-select').eq(0).hasClass('secondary-selected');
  var isReg = $('#h2h-selector .secondary-select').eq(1).hasClass('secondary-selected');
  var isPlayoff = $('#h2h-selector .secondary-select').eq(2).hasClass('secondary-selected');
  
  
  var showPtsSel = (!showCumAvgSel && !showH2HSel && stat =="pts" && $('.chart-select').eq(1).hasClass('chart-selected'));
  var isFor = $('#pts-selector .secondary-select').eq(0).hasClass('secondary-selected');
  if(showPtsSel){
      console.log(league);
  }
  
  var showWinsSel = (!showCumAvgSel && !showH2HSel && (stat =="wins" || stat == "reg_wins" || stat == "playoff_wins" || stat == "championship_wins"));
  var isWins = $('#wins-selector .secondary-select').eq(0).hasClass('secondary-selected');
  var isLosses = $('#wins-selector .secondary-select').eq(1).hasClass('secondary-selected');
  
  var showAcqsSel = (!showCumAvgSel && !showH2HSel && stat =="acqs");
  var isPicks = $('#acqs-selector .secondary-select').eq(0).hasClass('secondary-selected');
  
  var showRankSel = (!showCumAvgSel && !showH2HSel && stat =="rank");
  var isFinal = $('#rank-selector .secondary-select').eq(0).hasClass('secondary-selected');
  var isProj = $('#rank-selector .secondary-select').eq(1).hasClass('secondary-selected');
  
  var sznIndeces = [];
  for(var i = 0; i < szns.length; i++){
    sznIndeces.push(szns[i] - league.birthYr);
  }
  
  $.each(league.teams, function(i,team){ 
    for(var l = 0; l < sznIndeces.length; l++){
      /*if(teams.indexOf(team.names[l]) !== -1){
        if(teamNames.indexOf())
        teamNames.push(team.names[l]);
      }*/
      if(team.names[sznIndeces[l]] !== undefined){
        teamNames[team.id-1] = team.names[sznIndeces[l]];
      }
    }
    
    //getting member names
    console.log(team.names);
    console.log(teams[team.id-1]);
     console.log(team.id-1);
    for(var l = 0; l < sznIndeces.length; l++){
      var mems = [];
      if(team.names.indexOf(teams[team.id-1]) !== -1 && team.owners[sznIndeces[l]] !== undefined){
         $.each(team.owners[sznIndeces[l]], function(j,owner){
          if(members.indexOf(league.members[owner].firstName) !== -1){
              mems.push(league.members[owner].firstName);
          }
        }) 
      }
      if(mems.length > 0){
         memberNames[team.id-1] = mems.join(" / ");
      }
    }

    //getting scores
    var atLeastOneMember = false;
    for(var l = 0; l < sznIndeces.length; l++){
      if(team.names.indexOf(teams[team.id-1]) !== -1 && team.owners[sznIndeces[l]] !== undefined){
      $.each(team.owners[sznIndeces[l]], function(k, owner){
        if(members.indexOf(league.members[owner].firstName) !== -1){
          atLeastOneMember = true;
          return false;
        }
      })
      }
    }
    
    //getting wins/losses
    console.log(memberNames);
    if(teams.indexOf(teamNames[team.id-1]) !== -1 || team.names.indexOf(teams[team.id-1]) !== -1){
      if(atLeastOneMember){
        var randcol = colorArray[parseInt(team.id)];
        randColArr[parseInt(team.id) - 1] = randcol;
        console.log(team.id);
        if(stat == "pts"){
          //BAR
          numDataSets = 2;
          blabel1 = "Pts For";
          blabel2 = "Pts Against";
          var cumPtsFor = 0;
          var cumPtsAgainst = 0;
          var avgPtsFor = 0;
          var avgPtsAgainst = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumPtsFor += team.ptsFor[sznIndeces[l]];
              cumPtsAgainst += team.ptsAgainst[sznIndeces[l]];
              szncounter++;
            }
          }
          avgPtsFor = cumPtsFor/szncounter;
          avgPtsAgainst = cumPtsAgainst/szncounter;
          if(isCum){
            bdata1.push(cumPtsFor);
            bdata2.push(-cumPtsAgainst);
          }else{
            bdata1.push(avgPtsFor);
            bdata2.push(-avgPtsAgainst);
          }
          
          //HIST
          hdata = team.ptsFor;
          if(!isFor){
            hdata = team.ptsAgainst;
          }
          
        }else if(stat == "wins"){
          numDataSets = 3;
          //bdata1.push(team.wins.slice(-1)[0]);
          blabel1 = "Wins";
          //bdata2.push(-team.losses.slice(-1)[0]);
          blabel2 = "Losses";
          //bdata3.push(team.ties.slice(-1)[0]);
          blabel3 = "Ties";
          
          var cumWins = 0;
          var cumLosses = 0;
          var cumTies = 0;
          var avgWins = 0;
          var avgLosses = 0;
          var avgTies = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumWins += team.wins[sznIndeces[l]];
              cumLosses += team.losses[sznIndeces[l]];
              cumTies += team.ties[sznIndeces[l]];
              szncounter++;
            }
          }
          avgWins = cumWins/szncounter;
          avgLosses = cumLosses/szncounter;
          avgTies = cumTies/szncounter;
          if(isCum){
            bdata1.push(cumWins);
            bdata2.push(-cumLosses);
            bdata3.push(cumTies);
          }else{
            bdata1.push(avgWins);
            bdata2.push(-avgLosses);
            bdata3.push(avgTies);
          }
          
          const isAllZero = bdata3.every(item => item === 0);
          if(isAllZero){
            numDataSets = 2;
            $('#wins-selector').children().eq(2).hide();
          }else{
            $('#wins-selector').children().eq(2).show();
          }
          
          //HIST
          hdata = team.wins;
          if(isLosses){
            hdata = team.losses;
          }else if(!isWins){
            hdata = team.ties;
          }
          
        }else if(stat == "playoffs"){
          numDataSets = 1;
          blabel1 = "Playoff Appearances";
          
          var cumPlayoffAppearances = 0;
          var avgPlayoffAppearances = 0;
          var playoffAppearances = new Array(sznIndeces.length);
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var numPlayoffAppearances = team.all_scores[sznIndeces[l]].is_playoff.reduce(function(a, b){ return a + b;}, 0)
              cumPlayoffAppearances += numPlayoffAppearances;
              playoffAppearances[sznIndeces[l]] = numPlayoffAppearances;
              szncounter++;
            }
          }
          avgPlayoffAppearances = cumPlayoffAppearances/szncounter;
          if(isCum){
            bdata1.push(cumPlayoffAppearances);
          }else{
            bdata1.push(avgPlayoffAppearances);
          }
          
          //HIST
          hdata = playoffAppearances;
          
        }else if(stat == "fab"){
          numDataSets = 1;
          blabel1 = "FAB Spent";
          
          var cumFABSpent = 0;
          var avgFABSpent = 0;
          var szncounter = 0;
          var fabSpent = new Array(sznIndeces.length);
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var amntSpent = team.all_acqs[sznIndeces[l]].fab_spent
              cumFABSpent += amntSpent;
              fabSpent[sznIndeces[l]] = amntSpent;
              szncounter++;
            }
          }
          avgFABSpent = cumFABSpent/szncounter;
          if(isCum){
            bdata1.push(cumFABSpent);
          }else{
            bdata1.push(avgFABSpent);
          }
          
          //HIST
          hdata = fabSpent;
          
        }else if(stat == "winPct"){
          showCumAvgSel = false;
          numDataSets = 1;
          blabel1 = "Win Percentage";
          
          var cumWinPercentage = 0;
          var avgWinPercentage = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumWinPercentage += team.winPct[sznIndeces[l]];
              szncounter++;
            }
          }
          avgWinPercentage = cumWinPercentage/szncounter;
          bdata1.push(avgWinPercentage);
          
          //HIST
          hdata = team.winPct;
          
        }else if(stat == "draft"){
          showCumAvgSel = false;
          numDataSets = 1;
          blabel1 = "Draft Position";
          
          var cumDraftPos = 0;
          var avgDraftPos = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumDraftPos += team.draft_positions[sznIndeces[l]];
              szncounter++;
            }
          }
          avgDraftPos = cumDraftPos/szncounter;
          bdata1.push(avgDraftPos);
          
          //HIST
          hdata = team.draft_positions;
          
        }else if(stat == "rank"){
          numDataSets = 3;
          showCumAvgSel = false;
          transparent = true;
          //bdata1.push(team.wins.slice(-1)[0]);
          blabel1 = "Projected Rank";
          //bdata2.push(-team.losses.slice(-1)[0]);
          blabel2 = "Final Rank";
          //bdata3.push(team.ties.slice(-1)[0]);
          blabel3 = "Rank Differential";
          
          var finalRank = new Array(sznIndeces.length);
          var projRank = new Array(sznIndeces.length);
          var diffRank = new Array(sznIndeces.length);
          
          var cumProjRank = 0;
          var cumFinalRank = 0;
          var cumRankDiff = 0;
          var avgProjRank = 0;
          var avgFinalRank = 0;
          var avgRankDiff = 0;
          var szncounter = 0;
          var rankszncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var tmpf = team.all_ranks[sznIndeces[l]].final;
              var tmpp = team.all_ranks[sznIndeces[l]].projected;
              var tmpd = team.all_ranks[sznIndeces[l]].diff;
              
              cumProjRank += tmpp;
              cumFinalRank += tmpf;
              
              finalRank[sznIndeces[l]] = tmpf;
              projRank[sznIndeces[l]] = tmpp;
              diffRank[sznIndeces[l]] = tmpd;
              
              if(team.all_ranks[sznIndeces[l]].diff !== null){
                cumRankDiff += team.all_ranks[sznIndeces[l]].diff;
                rankszncounter++;
              }
              
              szncounter++;
            }
          }
          console.log(szncounter);
          avgProjRank = cumProjRank/rankszncounter;
          avgFinalRank = cumFinalRank/szncounter;
          //avgRankDiff = cumRankDiff/rankszncounter;
          avgRankDiff = avgFinalRank - avgProjRank;
          bdata1.push(avgProjRank);
          bdata2.push(avgFinalRank);
          bdata3.push(avgRankDiff);
          
          const isAllNull = bdata3.every(item => item === null);
          if(isAllNull){
            numDataSets = 2;
          }
          
          //HIST
          //HIST
          hdata = finalRank;
          if(isProj){
            hdata = projRank;
          }else if(!isFinal){
            hdata = diffRank;
          }
          
          
        }else if(stat == "injuries"){
          numDataSets = 1;
          blabel1 = "IR Moves";
          var numInjuries = new Array(sznIndeces.length);
          var cumInjuries = 0;
          var avgInjuries = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var tmpinj = team.moveToIR[sznIndeces[l]];
              cumInjuries += tmpinj;
              numInjuries[sznIndeces[l]] = tmpinj;
              szncounter++;
            }
          }
          avgInjuries = cumInjuries/szncounter;
          if(isCum){
            bdata1.push(cumInjuries);
          }else{
            bdata1.push(avgInjuries);
          }
          
          //HIST
          hdata = numInjuries;
          
        }else if(stat == "trades"){
          numDataSets = 1;
          blabel1 = "Trades";
          var numTrades = new Array(sznIndeces.length);
          var cumTrades = 0;
          var avgTrades = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var tmptrades = team.trades[sznIndeces[l]];
              cumTrades += tmptrades;
              numTrades[sznIndeces[l]] = tmptrades;
              szncounter++;
            }
          }
          avgTrades = cumTrades/szncounter;
          if(isCum){
            bdata1.push(cumTrades);
          }else{
            bdata1.push(avgTrades);
          }
          
          //HIST
          hdata = numTrades;
          
        }else if(stat == "lineup"){
          numDataSets = 1;
          blabel1 = "Lineup Edits";
          
          var numEdits = new Array(sznIndeces.length);
          
          var cumLineupEdits = 0;
          var avgLineupEdits = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var tmpEdits = team.lineup_edits[sznIndeces[l]];
              cumLineupEdits += tmpEdits;
              numEdits[sznIndeces[l]] = tmpEdits;
              szncounter++;
            }
          }
          avgLineupEdits = cumLineupEdits/szncounter;
          if(isCum){
            bdata1.push(cumLineupEdits);
          }else{
            bdata1.push(avgLineupEdits);
          }
          
          //HIST
          hdata = numEdits;
          
        }else if(stat == "acqs"){
          numDataSets = 2;
          blabel1 = "Pick Ups";
          blabel2 = "Drops";
          
          var numPicks = new Array(sznIndeces.length);
          var numDrops = new Array(sznIndeces.length);
          
          var cumPickUps = 0;
          var cumDrops = 0;
          var avgPickUps = 0;
          var avgDrops = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var tmpnump = team.all_acqs[sznIndeces[l]].total_acqs;
              var tmpnumd = team.all_acqs[sznIndeces[l]].total_drops;
              cumPickUps += tmpnump;
              cumDrops += tmpnumd;
              
              numPicks[sznIndeces[l]] = tmpnump;
              numDrops[sznIndeces[l]] = tmpnumd;
              
              szncounter++;
            }
          }
          avgPickUps = cumPickUps/szncounter;
          avgDrops = cumDrops/szncounter;
          if(isCum){
            bdata1.push(cumPickUps);
            bdata2.push(-cumDrops);
          }else{
            bdata1.push(avgPickUps);
            bdata2.push(-avgDrops);
          }
          
          //HIST
          hdata = numPicks;
          if(!isPicks){
            hdata = numDrops;
          }
          
        }else if(stat == "scorer"){
          
          /*showCumAvgSel = false;
          numDataSets = 2;
          blabel1 = "Highest Scorer";
          var allPlayerScores = {}; // {"playerId":[cumScore, numInstances]}
          var szncounter = 0;
          var numWeeksInSzn = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            numWeeksInSzn = team.all_scores[sznIndeces[l]].scores.length;
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              var rst = team.all_rosters[sznIndeces[l]].roster;
              for(var m = 0; m < rst.length; m++){
                if(allPlayerScores[rst[m].playerId] == undefined){
                  allPlayerScores[rst[m].playerId] = [rst[m].avgScore]
                  if(rst[m].avgScore == undefined){
                    var button = [];
                    console.log(rst[m]);
                    button.html('hello');
                  }
                }else{
                  allPlayerScores[rst[m].playerId].push(rst[m].avgScore);
                }
                
              }
              szncounter++;
            }
          }
          var scores = [];
          $.each(allPlayerScores, function(i, el){
            var avg = el => el.reduce((a, b) => a + b) / el.length;
            scores.push(avg);
          })
          var max = Math.max(...scores);
          console.log(allPlayerScores);
          /*if(isCum){
            bdata1.push(cumPickUps);
            bdata2.push(-cumDrops);
          }else{
            bdata1.push(avgPickUps);
            bdata2.push(-avgDrops);
          }*/
          
        }else if(stat == "reg_wins"){
          numDataSets = 3;
          //bdata1.push(team.wins.slice(-1)[0]);
          blabel1 = "Regular Season Wins";
          //bdata2.push(-team.losses.slice(-1)[0]);
          blabel2 = "Regular Season Losses";
          //bdata3.push(team.ties.slice(-1)[0]);
          blabel3 = "Regular Season Ties";
          
          var cumWins = 0;
          var cumLosses = 0;
          var cumTies = 0;
          var avgWins = 0;
          var avgLosses = 0;
          var avgTies = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumWins += team.reg_wins[sznIndeces[l]];
              cumLosses += team.reg_losses[sznIndeces[l]];
              cumTies += team.reg_ties[sznIndeces[l]];
              szncounter++;
            }
          }
          avgWins = cumWins/szncounter;
          avgLosses = cumLosses/szncounter;
          avgTies = cumTies/szncounter;
          if(isCum){
            bdata1.push(cumWins);
            bdata2.push(-cumLosses);
            bdata3.push(cumTies);
          }else{
            bdata1.push(avgWins);
            bdata2.push(-avgLosses);
            bdata3.push(avgTies);
          }
          
          const isAllZero = bdata3.every(item => item === 0);
          if(isAllZero){
            numDataSets = 2;
            $('#wins-selector').children().eq(2).hide();
          }else{
            $('#wins-selector').children().eq(2).show();
          }
          
          //HIST
          hdata = team.reg_wins;
          if(isLosses){
            hdata = team.reg_losses;
          }else if(!isWins){
            hdata = team.reg_ties;
          }
          
        }else if(stat == "playoff_wins"){
          numDataSets = 3;
          //bdata1.push(team.wins.slice(-1)[0]);
          blabel1 = "Playoff Wins";
          //bdata2.push(-team.losses.slice(-1)[0]);
          blabel2 = "Playoff Losses";
          //bdata3.push(team.ties.slice(-1)[0]);
          blabel3 = "Playoff Ties";
          
          var cumWins = 0;
          var cumLosses = 0;
          var cumTies = 0;
          var avgWins = 0;
          var avgLosses = 0;
          var avgTies = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumWins += team.playoff_wins[sznIndeces[l]];
              cumLosses += team.playoff_losses[sznIndeces[l]];
              cumTies += team.playoff_ties[sznIndeces[l]];
              szncounter++;
            }
          }
          avgWins = cumWins/szncounter;
          avgLosses = cumLosses/szncounter;
          avgTies = cumTies/szncounter;
          if(isCum){
            bdata1.push(cumWins);
            bdata2.push(-cumLosses);
            bdata3.push(cumTies);
          }else{
            bdata1.push(avgWins);
            bdata2.push(-avgLosses);
            bdata3.push(avgTies);
          }
          
          const isAllZero = bdata3.every(item => item === 0);
          if(isAllZero){
            numDataSets = 2;
            $('#wins-selector').children().eq(2).hide();
          }else{
            $('#wins-selector').children().eq(2).show();
          }
          
          //HIST
          hdata = team.playoff_wins;
          if(isLosses){
            hdata = team.playoff_losses;
          }else if(!isWins){
            hdata = team.playoff_ties;
          }
          
        }else if(stat == "championship_wins"){
          numDataSets = 2;
          //bdata1.push(team.wins.slice(-1)[0]);
          blabel1 = "Championship Wins";
          //bdata2.push(-team.losses.slice(-1)[0]);
          blabel2 = "Championship Losses";
          //bdata3.push(team.ties.slice(-1)[0]);
          blabel3 = "Championship Ties";
          
          var cumWins = 0;
          var cumLosses = 0;
          var cumTies = 0;
          var avgWins = 0;
          var avgLosses = 0;
          var avgTies = 0;
          var szncounter = 0;
          for(var l = 0; l < sznIndeces.length; l++){
            if(team.ptsFor[sznIndeces[l]] !== undefined){
              cumWins += team.championship_wins[sznIndeces[l]];
              cumLosses += team.championship_losses[sznIndeces[l]];
              cumTies += team.championship_ties[sznIndeces[l]];
              szncounter++;
            }
          }
          avgWins = cumWins/szncounter;
          avgLosses = cumLosses/szncounter;
          avgTies = cumTies/szncounter;
          if(isCum){
            bdata1.push(cumWins);
            bdata2.push(-cumLosses);
            bdata3.push(cumTies);
          }else{
            bdata1.push(avgWins);
            bdata2.push(-avgLosses);
            bdata3.push(avgTies);
          }
          
          const isAllZero = bdata3.every(item => item === 0);
          if(isAllZero){
            numDataSets = 2;
            $('#wins-selector').children().eq(2).hide();
          }else{
            $('#wins-selector').children().eq(2).show();
          }
          
          //HIST
          hdata = team.championship_wins;
          if(isLosses){
            hdata = team.championship_losses;
          }else if(!isWins){
            hdata = team.championship_ties;
          }
          
        }
        
        histDataSets.push(
          {
            label: teamNames[i-1],
            data: hdata,
            borderColor: randcol,
            backgroundColor: randcol,
          }
        )        
      }
    
    }
    
  });
  
  randColArr = $.grep(randColArr, n => n == 0 || n);
  memberNames = $.grep(memberNames, n => n == 0 || n);
  teamNames = $.grep(teamNames, n => n == 0 || n);
  console.log(histChart.data);
  if(transparent){
    blue = '#5f7ff58a';
    red = '#db4c4c96';
  }
  
  if(numDataSets == 3){
    blue = '#5f7ff58a';
    red = '#db4c4c96';
    barDataSets = [
    {
      label: blabel1,
      data: bdata1,
      borderColor: blue,
      backgroundColor: blue,
    },
    {
      label: blabel2,
      data: bdata2,
      borderColor: red,
      backgroundColor: red,
    },
    {
      label: blabel3,
      data: bdata3,
      borderColor: 'gray',
      backgroundColor: 'gray',
    }
  ];
    
    pieChart.data.datasets = [
      {
        label: blabel1,
        data: bdata1,
        borderColor: '#161718',
        backgroundColor: randColArr
      },
      {
        label: blabel2,
        data: bdata2,
        borderColor: '#161718',
        backgroundColor: randColArr
      },
      {
        label: blabel3,
        data: bdata3,
        borderColor: '#161718',
        backgroundColor: randColArr
      }
    ];
  }else if(numDataSets == 2){
    barDataSets = [
    {
      label: blabel1,
      data: bdata1,
      borderColor: blue,
      backgroundColor: blue,
    },
    {
      label: blabel2,
      data: bdata2,
      borderColor: red,
      backgroundColor: red,
    }
  ];
    
    pieChart.data.datasets = [
      {
        label: blabel1,
        data: bdata1,
        borderColor: '#161718',
        backgroundColor: randColArr
      },
      {
        label: blabel2,
        data: bdata2,
        borderColor: '#161718',
        backgroundColor: randColArr
      }
    ];
  }else{
    barDataSets = [
      {
        label: blabel1,
        data: bdata1,
        borderColor: blue,
        backgroundColor: blue,
      }
    ];
    
    pieChart.data.datasets = [
      {
        label: blabel1,
        data: bdata1,
        borderColor: '#161718',
        backgroundColor: randColArr
      }
    ];
  }
  
  $('.dropdown-selector').hide();
  
  if(showH2HSel){
      $('#mem-selector').show();
  }else{
      $('#stat-selector').show();
  }
  
  $('.secondary-selector').hide();
  if(showCumAvgSel){
    $('#cum-avg-selector').show();
  }else if(showH2HSel){
    $('#h2h-selector').show();
  }else if(showPtsSel){
    $('#pts-selector').show();
  }else if(showWinsSel){
    $('#wins-selector').show();
  }else if(showAcqsSel){
    $('#acqs-selector').show();
  }else if(showRankSel){
    $('#rank-selector').show();
  }
  
  barChart.data.labels = memberNames;
  barChart.data.datasets = barDataSets;
  barChart.update();
  
  histChart.data.labels=szns;
  histChart.data.datasets = histDataSets;
  histChart.update();
  
  //
 
  pieChart.data.labels = memberNames;
  pieChart.options.elements.arc.borderWidth = 5;
  /*pieChart.data.datasets = [
      {
        data: barDataSets[0].data,
        borderColor: '#161718',
        backgroundColor: randColArr
      }
    ];*/
  pieChart.update();
  
  
  //DATA MOD for table view
  var mainMem = $('#memberVal').val();
  var allOtherMems = {};
  if(showH2HSel){
      // DATA COLLECT
      for(var l = 0; l < sznIndeces.length; l++){
          $.each(league.teams, function(i, tm){
              var owners = tm.owners[sznIndeces[l]];
              if(owners !== undefined && owners.indexOf(mainMem) !== -1){
                  var allScoresObj = tm.all_scores[sznIndeces[l]]; // for this szn
                  for(k = 0; k < allScoresObj.scores.length; k++){
                      var againstTm = allScoresObj.against[k];
                      console.log(againstTm);
                      if(league.teams[againstTm] !== undefined){
                      var owners = league.teams[againstTm].owners[sznIndeces[l]];
                      for(var m = 0; m < owners.length; m++){
                      if(allOtherMems[owners[m]] == undefined){
                          allOtherMems[owners[m]] = {
                              cum_score: parseInt(allScoresObj.scores[k]),
                              cum_against_score: parseInt(allScoresObj.against_score[k]),
                              cum_wins: 0,
                              cum_losses: 0,
                              cum_ties: 0,
                              reg_score: 0,
                              reg_against_score: 0,
                              reg_wins: 0,
                              reg_losses: 0,
                              reg_ties: 0,
                              playoff_score: 0,
                              playoff_against_score: 0,
                              playoff_wins: 0,
                              playoff_losses: 0,
                              playoff_ties: 0,
                              champ_score: 0,
                              champ_against_score: 0,
                              champ_wins: 0,
                              champ_losses: 0,
                              champ_ties: 0
                          }
                          var w = allScoresObj.scores[k] > allScoresObj.against_score[k];
                          var tie = allScoresObj.scores[k] == allScoresObj.against_score[k];
                          if(allScoresObj.is_playoff[k] && k == allScoresObj.scores.length - 1){
                              if(w){
                                  allOtherMems[owners[m]].champ_wins = 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].champ_ties = 1;
                              }else{
                                  allOtherMems[owners[m]].champ_losses = 1;
                              }
                              allOtherMems[owners[m]].champ_score = parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].champ_against_score = parseInt(allScoresObj.against_score[k]);
                              
                          }else if(allScoresObj.is_playoff[k]){
                               if(w){
                                  allOtherMems[owners[m]].playoff_wins = 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].playoff_ties = 1;
                              }else{
                                  allOtherMems[owners[m]].playoff_losses = 1;
                              }
                              allOtherMems[owners[m]].playoff_score = parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].playoff_against_score = parseInt(allScoresObj.against_score[k]);
                          }else if(!allScoresObj.is_playoff[k]){
                               if(w){
                                  allOtherMems[owners[m]].reg_wins = 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].reg_ties = 1;
                              }else{
                                  allOtherMems[owners[m]].reg_losses = 1;
                              }
                              allOtherMems[owners[m]].reg_score = parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].reg_against_score = parseInt(allScoresObj.against_score[k]);
                          }
                          
                           if(w){
                              allOtherMems[owners[m]].cum_wins = 1;
                          }else if(tie){
                              allOtherMems[owners[m]].cum_ties = 1;
                          }else{
                              allOtherMems[owners[m]].cum_losses = 1;
                          }
                          
                          // Championship
                          
                      }else{
                          var w = allScoresObj.scores[k] > allScoresObj.against_score[k];
                          var tie = allScoresObj.scores[k] == allScoresObj.against_score[k];
                          if(allScoresObj.is_playoff[k] && k == allScoresObj.scores.length - 1){
                              if(w){
                                  allOtherMems[owners[m]].champ_wins += 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].champ_ties += 1;
                              }else{
                                  allOtherMems[owners[m]].champ_losses += 1;
                              }
                              allOtherMems[owners[m]].champ_score += parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].champ_against_score += parseInt(allScoresObj.against_score[k]);
                              
                          }else if(allScoresObj.is_playoff[k]){
                               if(w){
                                  allOtherMems[owners[m]].playoff_wins += 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].playoff_ties += 1;
                              }else{
                                  allOtherMems[owners[m]].playoff_losses += 1;
                              }
                              allOtherMems[owners[m]].playoff_score += parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].playoff_against_score += parseInt(allScoresObj.against_score[k]);
                          }else if(!allScoresObj.is_playoff[k]){
                               if(w){
                                  allOtherMems[owners[m]].reg_wins += 1;
                              }else if(tie){
                                  allOtherMems[owners[m]].reg_ties += 1;
                              }else{
                                  allOtherMems[owners[m]].reg_losses += 1;
                              }
                              allOtherMems[owners[m]].reg_score += parseInt(allScoresObj.scores[k]);
                              allOtherMems[owners[m]].reg_against_score += parseInt(allScoresObj.against_score[k]);
                          }
                          
                           if(w){
                              allOtherMems[owners[m]].cum_wins += 1;
                          }else if(tie){
                              allOtherMems[owners[m]].cum_ties += 1;
                          }else{
                              allOtherMems[owners[m]].cum_losses += 1;
                          }
                            allOtherMems[owners[m]].cum_score += parseInt(allScoresObj.scores[k]);
                            allOtherMems[owners[m]].cum_against_score += parseInt(allScoresObj.against_score[k]);
                      }
                      
                          
                      }
                  }
                  }
              }      
          })
      }
      
      console.log(allOtherMems);
      
      $('.col-mems, .col-stats').html("");
      $('#h2h-table').html('<tr><th>Opponent</th><th>Record (W-L-T)</th><th>Win %</th><th>Points For</th><th>Points Against</th></tr>');
      for(i = 0; i < members.length; i++){
         if(memberIDs[i] !== mainMem){
             console.log(memberIDs[i]);
             if(allOtherMems[memberIDs[i]] == undefined){
                 allOtherMems[memberIDs[i]] = {
                              cum_score: 0,
                              cum_against_score: 0,
                              cum_wins: 0,
                              cum_losses: 0,
                              cum_ties: 0,
                              reg_score: 0,
                              reg_against_score: 0,
                              reg_wins: 0,
                              reg_losses: 0,
                              reg_ties: 0,
                              playoff_score: 0,
                              playoff_against_score: 0,
                              playoff_wins: 0,
                              playoff_losses: 0,
                              playoff_ties: 0,
                              champ_score: 0,
                              champ_against_score: 0,
                              champ_wins: 0,
                              champ_losses: 0,
                              champ_ties: 0
                          }
             }
             
             var t_wins = allOtherMems[memberIDs[i]].cum_wins;
             var t_losses = allOtherMems[memberIDs[i]].cum_losses;
             var t_ties = allOtherMems[memberIDs[i]].cum_ties;
             var t_score = allOtherMems[memberIDs[i]].cum_score;
             var t_against_score = allOtherMems[memberIDs[i]].cum_against_score;
             
             // classes
             var twc = "";
             var tlc = "";
             var ttc = "";
             var tsc = "";
             var toc = "";
             
             if(isAll){
                 
             }else if(isReg){
                 t_wins = allOtherMems[memberIDs[i]].reg_wins;
                 t_losses = allOtherMems[memberIDs[i]].reg_losses;
                 t_ties = allOtherMems[memberIDs[i]].reg_ties;
                 t_score = allOtherMems[memberIDs[i]].reg_score;
                 t_against_score = allOtherMems[memberIDs[i]].reg_against_score;
             }else if(isPlayoff){
                 t_wins = allOtherMems[memberIDs[i]].playoff_wins;
                 t_losses = allOtherMems[memberIDs[i]].playoff_losses;
                 t_ties = allOtherMems[memberIDs[i]].playoff_ties;
                 t_score = allOtherMems[memberIDs[i]].playoff_score;
                 t_against_score = allOtherMems[memberIDs[i]].playoff_against_score;
             }else{
                 t_wins = allOtherMems[memberIDs[i]].champ_wins;
                 t_losses = allOtherMems[memberIDs[i]].champ_losses;
                 t_ties = allOtherMems[memberIDs[i]].champ_ties;
                 t_score = allOtherMems[memberIDs[i]].champ_score;
                 t_against_score = allOtherMems[memberIDs[i]].champ_against_score;
             }
             
             var t_wp = Math.round((t_wins/(t_wins+t_losses+t_ties))*10000)/100;
             if(t_wins+t_losses+t_ties == 0){
                 t_wp = 0;
             }
             var twpc = "";
             
             if(t_wins > t_losses){
                 twc ="win-green";
             }else if(t_wins < t_losses){
                 twc= "loss-red";
             }
             
          $('.col-mems').append('<div class="col-mem '+twc+'">'+members[i]+' <span class="dispname">('+league.members[memberIDs[i]].displayName+')</span>'+'</div>')
          $('.other-cols-wrap .col').eq(0).children().eq(1).append('<div class="col-stat '+twc+'">'+t_wins+'-'+t_losses+'-'+t_ties+'</div>');
          $('.other-cols-wrap .col').eq(1).children().eq(1).append('<div class="col-stat '+twc+'">'+t_wp+'%</div>');
          $('.other-cols-wrap .col').eq(2).children().eq(1).append('<div class="col-stat '+twc+'">'+t_score+'</div>');
          $('.other-cols-wrap .col').eq(3).children().eq(1).append('<div class="col-stat '+twc+'">'+t_against_score+'</div>');
          
         }
          
      }
      
      $('#h2h2-table tr:last-child').append('<td>Hey</td>');
  }
  
  
}


// End Comparative States

// Historical Stats:
var legendPos = "right";
var dispLeg = true;
function initializePlots(){
    //legendPos = "right";
    if ($(document).width() <= 600) {
        //legendPos = "bottom";
        dispLeg = false;
    }
    
  //BAR  
  //labels: memberNames
  const barConfig = {
  type: 'bar',
  data: {
  labels: [],
  datasets: []
},
  options: {
    indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 5
      }
    },
    responsive: true,
    scales: {
      y: {
        ticks: {
          color: 'white'
        },
        stacked: true
      },
      x: {
        ticks: {
          color: 'white'
        }
      }
    },
    plugins: {
      legend: {
        display: dispLeg,
        position: legendPos,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Bar Chart',
        color: 'white'
      }
    }
  },
};
const barCtx = document.getElementById('compChart').getContext('2d');
barChart = new Chart(barCtx, barConfig);
  
  //HIST
  //labels : szns
  const histConfig = {
  type: 'line',
  data: {
  labels: [],
  datasets: []
},
  options: {
    responsive: true,
    scales: {
      y: {
        ticks: {
          color: 'white'
        }
      },
      x: {
        ticks: {
          color: 'white'
        }
      }
    },
    plugins: {
      legend: {
        display: dispLeg,
        position: legendPos,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Historical Chart',
        color: 'white'
      }
    }
  },
};
  const histCtx = document.getElementById('histChart').getContext('2d');
  histChart = new Chart(histCtx, histConfig);
  
   //Pie
  const pieConfig = {
  type: 'pie',
  data: {
  labels: [],
  datasets: []
},
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context){
            var label = context.label,
                currentValue = context.raw,
                total = context.chart._metasets[context.datasetIndex].total;

            var percentage = parseFloat((currentValue/total*100).toFixed(1));
            console.log(context);
            return context.dataset.label + ": " +currentValue.toFixed(2) + ' (' + percentage + '%)';
          },
          title: function(context){
            console.log(context);
            return context[0].label;
          }
        }
      },
      legend: {
        display: dispLeg,
        position: legendPos,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Pie Chart',
        color: 'white'
      }
    }
  },
};
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(pieCtx, pieConfig);
  
  
  

  
  $('canvas').hide();
}
initializePlots();


$(window).resize(function() {
  var newLPos ="";
  var newDispLeg = true;
  if ($(document).width() <= 600) {
        //newLPos = "bottom";
        newDispLeg = false;
    }else{
        newLPos = "right";
        newDispLeg = true;
    }
    if(newDispLeg !== dispLeg){
        dispLeg = newDispLeg;
        updateLegend();
    }
});

function updateLegend(){
    
  // Resolution is 1024x768 or above
  barChart.options.plugins.legend.display = dispLeg;
  histChart.options.plugins.legend.display = dispLeg;
  pieChart.options.plugins.legend.display = dispLeg;
  
  
  barChart.update();
  histChart.update();
  pieChart.update();
}


$('.chart-select').click(function(){
  $('canvas, .freeze-table').hide();
  $('.chart-select').removeClass('chart-selected');
  $(this).addClass('chart-selected');
  $('#stat-selector .dropdown .dropdown-item').eq(5).show();
$('#stat-selector .dropdown .dropdown-item').eq(6).show();
  getFilteredArrays();
  if($(this)[0].innerHTML==$(this).parent().children().eq(0)[0].innerHTML){
    $('#compChart').show();
  }else if($(this)[0].innerHTML==$(this).parent().children().eq(1)[0].innerHTML){
    $('#histChart').show();
  }else if($(this)[0].innerHTML==$(this).parent().children().eq(2)[0].innerHTML){
    $('#pieChart').show();
    $('#stat-selector .dropdown .dropdown-item').eq(5).hide();
    $('#stat-selector .dropdown .dropdown-item').eq(6).hide();
  }else if($(this)[0].innerHTML==$(this).parent().children().eq(3)[0].innerHTML){
    $('#h2h-table, .freeze-table').show();
    
  }
 
})


// FILTER FUNCTIONS:

$('.allSelector').click(function(){
  var secTitle = $(this).parent().children().eq(0).html();
  var wrap = $(this).parent().children().eq(2);
  var show = $(this).hasClass('selectAll');
  if(show){
    $(this).html('Deselect All');
  }else{
    $(this).html('Select All');
  }
  $.each(wrap.children(), function(i, el){
    $(el).children(0).prop('checked', show);
  });
  
  $(this).toggleClass('deselectAll selectAll');      
      getFilteredArrays();
    })

function getFilteredArrays(){
  var newTeams = new Array(Object.keys(league.teams).length);
      $.each($('#teamFilters .filterContainer').children(), function(i, el){
        if($(el).children(0).is(":checked")){
          newTeams[i] = el.children[1].innerHTML;
        }
      });
      var newMembers = [];
      var newMemberIds = [];
      $.each($('#memberFilters .filterContainer').children(), function(i, el){
        if($(el).children(0).is(":checked")){
          newMembers.push(el.children[1].innerHTML.split(" <span")[0]);
          newMemberIds.push($(el).children().eq(0).attr('data-member-id'));
        }
      });
      var newSzns = [];
      $.each($('#sznFilters .filterContainer').children(), function(i, el){
        if($(el).children(0).is(":checked")){
          newSzns.push(el.children[1].innerHTML);
        }
      });
  newSzns.sort(function(a, b) {
    return a - b;
  });
  newSzns = $.grep(newSzns, n => n == 0 || n);
  var stat = $('#stat').val();
  console.log(newMemberIds);
  dataMod(newTeams, newMembers, newSzns, stat, newMemberIds);
 
}

$('.dropdown-selector').click(function(){
  var thisel = this;
  
  var clicked = $(this).hasClass('stat-selected');
  if(clicked){
    $(this).children().eq(2).slideUp("fast",function(){
      $(thisel).find('.dropdown-item').show();
  $.each($(thisel).find('.dropdown-item'), function(i, el){
    if($(el).html() == $(thisel).children().eq(1).html()){
      $(el).hide();
      return false;
    }
  })
    });
  }else{
    $(this).children().eq(2).slideDown("fast",function(){
      $(thisel).find('.dropdown-item').show();
  $.each($(thisel).find('.dropdown-item'), function(i, el){
    if($(el).html() == $(thisel).children().eq(1).html()){
      $(el).hide();
      return false;
    }
  })
    });
  }
  
  $(this).toggleClass('stat-selected');
  
  
})

$('.dropdown-item').click(function(){
  $(this).parent().parent().children().eq(1).html($(this).html());
  $(this).parent().parent().children().eq(0).prop('value',$(this).attr('data-val'));
  getFilteredArrays();
})

$('.secondary-select').click(function(){
  $(this).parent().children().removeClass('secondary-selected');
  $(this).addClass('secondary-selected');
  getFilteredArrays();
})

$('#navBtnWrap').click(function(){
  $('#chartFilters').css('left','0px');
})
$('#closeFilters').click(function(){
  $('#chartFilters').css('left','-214px');
})




