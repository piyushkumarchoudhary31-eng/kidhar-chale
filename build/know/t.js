const fs=require('fs');global.window={bgPlaces:[],bgCoords:()=>null};eval(fs.readFileSync(__dirname+'/enforce.js','utf8'));
const p={days:[{day:1,city:'Delhi → Pathankot',items:[{time:'20:00',what:'Dinner near ISBT',cost:120,kind:'food'},{time:'20:30',what:'HRTC or Punjab Roadways ordinary bus from Kashmere Gate ISBT to Pathankot (~10 h)',cost:550,kind:'travel'}]},
{day:2,city:'Pathankot → McLeod Ganj',items:[{time:'06:30',what:'Arrive Pathankot bus stand, chai and paratha',cost:60,kind:'food'},{time:'07:15',what:'HRTC bus to Dharamshala (~3.5 h)',cost:180,kind:'travel'},{time:'11:30',what:'Local bus up to McLeod Ganj (~30 min)',cost:20,kind:'travel'}]},
{day:3,city:'Triund trek',items:[{time:'07:00',what:'Walk from Galu Devi temple trailhead up to Triund (~3–4 h)',cost:0,kind:'sight'},{time:'16:00',what:'Auto back to McLeod',cost:0,kind:'travel'}]},
{day:4,city:'Rishikesh → Shimla',items:[{time:'09:00',what:'Volvo bus Rishikesh → Shimla (~9 h)',cost:900,kind:'travel'},{time:'20:00',what:'Dinner on the Mall',cost:200,kind:'food'}]},
{day:5,city:'Shimla → Delhi',items:[{time:'08:00',what:'Breakfast',cost:100,kind:'food'},{time:'10:30',what:'Budget flight Shimla → Delhi (~1 h)',cost:4000,kind:'travel'}]}]};
kcEnforce(p);kcEnforce(p);p.days.forEach(d=>{console.log('Day',d.day,d.city);d.items.forEach(i=>console.log('  ',i.time,i.kind,i.cost,i.what))});console.log(p.know)
