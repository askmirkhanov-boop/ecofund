const ecoFundAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

let provider;
let signer;
let contract;
let userAddress;

const abi = [
  "function createCampaign(string,string,uint256,uint256)",
  "function contribute(uint256) payable",
  "function finalizeCampaign(uint256)",
  "function getCampaignCount() view returns(uint256)",
  "function campaigns(uint256) view returns(string,string,uint256,uint256,uint256,address,bool)"
];

async function connectWallet() {
  await window.ethereum.request({ method: "eth_requestAccounts" });

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  contract = new ethers.Contract(ecoFundAddress, abi, signer);

  document.getElementById("wallet").innerText =
    "Connected: " + userAddress;

  loadCampaigns();
}

async function createCampaign() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const goal = document.getElementById("goal").value;
  const days = document.getElementById("duration").value;

  const seconds = days * 86400;

  const tx = await contract.createCampaign(
    title,
    description,
    ethers.parseEther(goal),
    seconds
  );

  await tx.wait();
  alert("Campaign created!");

  loadCampaigns();
}

async function contribute(id) {
  const amount = prompt("Enter ETH amount");
  if (!amount) return;

  const tx = await contract.contribute(id, {
    value: ethers.parseEther(amount)
  });

  await tx.wait();
  alert("Donation successful!");

  loadCampaigns();
}

async function finalizeCampaign(id) {
  const tx = await contract.finalizeCampaign(id);
  await tx.wait();
  alert("Campaign finalized");

  loadCampaigns();
}

async function loadCampaigns() {
  if (!contract) return;

  const container = document.getElementById("campaigns");
  container.innerHTML = "";

  const count = await contract.getCampaignCount();

  for (let i = 0; i < count; i++) {
    const c = await contract.campaigns(i);

    const goalEth = ethers.formatEther(c[2]);
    const raisedEth = ethers.formatEther(c[4]);

    const goal = Number(goalEth);
    const raised = Number(raisedEth);
    const percent = Math.min((raised / goal) * 100, 100);

    const deadline = Number(c[3]);
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = Math.max(deadline - now, 0);

    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);

    const ended = secondsLeft <= 0 || c[6];
    const isCreator =
      c[5].toLowerCase() === userAddress?.toLowerCase();

    const div = document.createElement("div");
    div.className = "campaign-card";

    div.innerHTML = `
      <h3>${c[0]}</h3>
      <p>${c[1]}</p>

      <p class="creator">
        Creator: ${c[5].slice(0, 6)}...${c[5].slice(-4)}
      </p>

      <div class="stats">
        <div>Goal: <span>${goalEth} ETH</span></div>
        <div>Raised: <span>${raisedEth} ETH</span></div>
      </div>

      <div class="progress">
        <div class="progress-bar" style="width:${percent}%"></div>
      </div>

      <p class="time-left">
        ${
          ended
            ? "✅ Campaign ended"
            : `⏳ ${days}d ${hours}h ${minutes}m left`
        }
      </p>

      ${
        !ended
          ? `<button onclick="contribute(${i})">Donate</button>`
          : ""
      }

      ${
        ended && isCreator
          ? `<button onclick="finalizeCampaign(${i})">
               Finalize Campaign
             </button>`
          : ""
      }
    `;

    container.appendChild(div);
  }
}

window.connectWallet = connectWallet;
window.createCampaign = createCampaign;
window.contribute = contribute;
window.finalizeCampaign = finalizeCampaign;
