import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import twitterLogo from './twitter-logo.svg';
import mintNFT from './utils/mintNFT.json';
//import mintNFT from "/Users/arken/BuildonChainProjects/NFT-Display/nftproj/artifacts/contracts/mintNFT.sol/mintNFT.json";
import { Web3Storage } from 'web3.storage'
import { getFilesFromPath } from 'web3.storage'
import  { Buffer }  from "buffer";
import { create, urlSource } from 'ipfs-http-client';
//import { IPFS } from 'ipfs'
//const IPFS = require('ipfs');

const axios = require('axios').default;
const TWITTER_HANDLE = 'borde_dheeraj';
const TWITTER_LINK = `https://twitter.com/borde_dheeraj`;
const CONTRACT_ADDRESS = '0x9121298206e1ea811cD928eDb0a8e6B00BB75Fae';
if (!window.Buffer) {
  window.Buffer = Buffer;
}

function App() {
	const[contentCID, setContentCID] = useState('');
	const[nftJsonCID, setnftJsonCID] = useState('');
	//const[fileObj, setFileObj] = useState('');
	const { currentAccount, setCurrentAccount } = useState('');

	

	function getAccessToken () {
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFDQzI4ZjM2MUY1MEYwMDRkMDhlQzQ5NjA3OGUyNkY2MjkzMzc1QjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTQxNjUwNjM2MjcsIm5hbWUiOiJuZnRTdG9yYWdlIn0.tahXtWJGHQfsguCH7VMFc-zaNH_9JMQlMsUi1HgemW0'

	}

	function makeStorageClient () {
		return new Web3Storage({ token: getAccessToken() })
	}
	const imgUrl = "https://cdn.pixabay.com/photo/2018/08/24/23/33/field-3629120_960_720.jpg";

	async function getFilesFromPath (path) {
		const files = await getFilesFromPath(path)
		console.log(`read ${files.length} file(s) from ${path}`)
		return files
	}
	  //https://bafybeih5o5j3dbti5q5mbkiprkd2qvqtowazfhnv4cube6h4iqbd4szgyq.ipfs.dweb.link/
	  //https://bafybeidy2itwjrzccv54bdthfk342r4t6ymibg3ajaptl2nnshaeohjsam.ipfs.dweb.link/IpfsDemo.txt
	let linkImageMeta;
	const  makeFileObjects = async (imgUrl)=> {
		
		const response = await axios.get(imgUrl,  { responseType: 'arraybuffer' })
		const buffer1 = Buffer.from(response.data, "utf-8")
		const files = [
			new File([buffer1], 'IpfsImage.png'),
		]
		console.log(files);
		return files
	}
	const  makeJsonFileObjects = async (imageIpfssrc)=> {
		const obj = { Description: 'this is nature nft,version One', image:imageIpfssrc, name: 'nftTruts' }
		const buffer = Buffer.from(JSON.stringify(obj))

		const files = [
			//new File(['This is stored in Ipfs'], 'IpfsText.txt'),
			new File([buffer], 'nftTruts.json')
		]
		console.log(files);
		return files
	}

	const  makeJsonFileObjectsProfile = async ()=> {
		const obj = { 
			Description: 'this is profile json nft,version one ', name: 'nftTruts' }
		const buffer = Buffer.from(JSON.stringify(obj))

		const files = [
			//new File(['This is stored in Ipfs'], 'IpfsText.txt'),
			new File([buffer], 'nftTruts.json')
		]
		console.log(files);
		return files
	}


	//const fileObj = getFilesFromPath('https://cdn.pixabay.com/photo/2018/08/24/23/33/field-3629120_960_720.jpg');

	async function storeImageFiles () {
		const fileObj = await makeFileObjects(imgUrl);
		//console.log(fileObj)
		const client = makeStorageClient()
		const cid = await client.put(fileObj)
		console.log('stored files with cid:', cid)
		setContentCID(cid);
		return cid
	}

	async function storeJsonFiles () {
		//const ipfsImageLink = await getLinks(contentCID)
		//const fileObj = await makeJsonFileObjects(ipfsImageLink);

		const ipfs = await create();
		const file = await ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))
		console.log(file)

		const fileObj = await makeJsonFileObjectsProfile();
		console.log(fileObj)
		const client = makeStorageClient()
		const cid = await client.put(fileObj, {name: 'profileJson'})
		console.log('stored files with cid:', cid)
		setnftJsonCID(cid);

		return cid
	}

	async function retrieveFiles (cid) {
		const client = makeStorageClient()
		const res = await client.get(cid)
		console.log(`Got a response! [${res.status}] ${res.statusText}`)
		console.log(res);
		if (!res.ok) {
		  throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)
		}
	  
		// unpack File objects from the response
		const files = await res.files()
		console.log(files);
		for (const file of files) {
		  console.log(`${file.cid} -- ${file.name} -- ${file.size}`)
		}
		setContentCID('');
	}

	async function getLinks(ipfsPath) {
		const url = 'https://dweb.link/api/v0';
		const ipfs = create({ url });
	
		const links = [];
		for await (const link of ipfs.ls(ipfsPath)) {
			links.push(link);
		}
		console.log(links[0]);

		//retrieveFiles(links[0].path);
		linkImageMeta = "ipfs://" + links[0].path ;
		console.log(linkImageMeta);
		return linkImageMeta;
	}

	const myNFTMint = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					mintNFT.abi,
					signer
				);
				console.log(connectedContract);
				console.log(linkImageMeta);
        		console.log('Going to pop window for gas fee');
				let deployedtxn = await connectedContract.mintUserNFT(linkImageMeta);

				console.log('Minning the NFT..');
				await deployedtxn.wait();

				console.log(
					`Mined, see transaction: https://mumbai.polygonscan.com/tx/${
						deployedtxn.hash
					}`
				)

			
			} else {
				console.log('Ethereum object does not exist..');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const setupEventListner = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					mintNFT.abi,
					signer
				);

				connectedContract.on('NewNFTMinted', (from, tokenId) => {
					console.log(from, tokenId.toNumber());
					alert(`Hey there! We've minted your NFT and sent it to your wallet.
It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
				});

				console.log('Setup event listener!');
			} else {
				console.log('Ethereum object does not exist..');
			}
		} catch (error) {
			console.log(error);
		}
	};
	const checkConnectedWallet = async () => {
		const { ethereum } = window;

		const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
		console.log(accounts);
		if (accounts.length !== 0) {
			const account = accounts[0];
			let chainId = await ethereum.request({method: 'eth_chainId'});
			console.log("The Chain Id is : "+ chainId);

			const chainIdRinkeby = "0x13881";
			if(chainId !== chainIdRinkeby){
				console.log("Check if your metamask is connected to polygon network")
			}
			
			console.log('Authorized account found: ', account);
			return;
  		} else {
  			console.log('No authorised account found');
  		}
	};

	const connectWallet = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			alert('Get Metamask..!');
			return;
		}

		const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

		console.log('Connected to: ', accounts[0]);
		setCurrentAccount(accounts[0]);

		setupEventListner();
	};

	const renderNotConnectedContainer = () => {
		<button
			onClick={connectWallet}
			className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>;
	};

	// const renderFile = () => {
	// 	<button
	// 		onClick={()=>storeFiles(fileObj)}
	// 		className="cta-button connect-wallet-button">
	// 		Store-Files
	// 	</button>;
	// };

	//useEffect checks condition or triggers function everytime the page reloads
	useEffect(() => {
		checkConnectedWallet();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">IPFS Storage </p>
					
					{currentAccount === '' ? 
						renderNotConnectedContainer()
					 : 
					 <div>
					 	<button  className="cta-button-collection nft-collection-button" onClick={() => storeImageFiles()}>
							Upload image Files
						</button>
						
					</div>
					 }
						
					{nftJsonCID === ''? 
						<button  className="cta-button-collection nft-collection-button" onClick={() => storeJsonFiles()}>
							Upload json Files
						</button>
					:
					<div>
					<button  className="cta-button-collection nft-collection-button" onClick={() => getLinks(nftJsonCID)}>
							Queryfiles
						</button>
						<button onClick={()=>retrieveFiles(nftJsonCID)} className="cta-button mint-button ">
							Retrive
						</button>
					</div>
					}
					
				

				

			</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built by @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
//   {/* <a href="https://testnets.opensea.io/collection/shapenft-tb8xlKHnxJ" target="_blank">
//           <button  className="cta-button-collection nft-collection-button" onClick={storeFiles(fileObj)}>
          
//             Shit NFT Collection
//           </button></a> */}

{/* <form method="get" enctype="multipart/form-data">
<div>
	<label for="avatar" color="yellow">Choose a profile picture:</label>
	<input type="file"
		id="avatar" name="avatar"
		accept="image/png, image/jpeg">

	</input>
</div>
<div>
<button  className="cta-button-collection nft-collection-button" onClick={() => getFiles()}>
	get Files
</button>
</div>
</form> */}