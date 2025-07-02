import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createNullProgramRepository, createUmi, generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { web3JsRpc } from "@metaplex-foundation/umi-rpc-web3js";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = await getKeypairFromFile("./keypair.json");
await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 1000_000_000);

console.log("lamport ", user.publicKey.toBase58());

const umi = createUmi()
  .use(web3JsRpc(clusterApiUrl("devnet")))
  .use(mplTokenMetadata());

umi.programs = createNullProgramRepository(); // ✅ Register program repository

const umi_user = umi.eddsa.createKeypairFromFile("./keypair.json");
umi.use(keypairIdentity(umi_user));

const collectionMint: any = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "My NFT",
  symbol: "MNFT",
  uri: "https://raw.githubusercontent.com/kanhadewangan/nfts_sol/main/data.json",
  sellerFeeBasisPoints: percentAmount(10), // 10% royalties
  isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
console.log(
  "Created NFT:",
  createdNft,
  "\nExplorer link: " + getExplorerLink("address", createdNft.mint.toString(), "devnet")
);
