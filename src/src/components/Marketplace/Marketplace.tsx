import { useEffect, useState } from "react";
import css from "../NFTs/NFTs.module.css";
import useTenkNear from "../../hooks/useTenkNear";
import useAuctionNear from "../../hooks/useAuctionNear";
import NFTModal from "../NFTModal/NFTModal";
import { useSaleNFTs } from "../../hooks/useSaleNFTs";

const ONE_DAY = 1000 * 60 * 60 * 24;

export const Marketplace = () => {
  const [showModal, setShowModal] = useState({
    name: "",
    nftid: "",
    loading: false,
  });

  const { Tenk } = useTenkNear();
  const { Auction } = useAuctionNear();

  const saleNFTsQuery = useSaleNFTs(Tenk, Auction);
  const { data: nfts = [] } = saleNFTsQuery;

  const [timeLeft, setTimeLeft] = useState<String[]>();

  useEffect(() => {
    const timeoutId = setTimeout(step, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  });

  function step() {
    // const nowTime = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).getTime();
    const nowTime = new Date().getTime();
    const lefts: string[] = [];
    for (let i = 0; i < nfts?.length!; i++) {
      const end_at = nfts![i].sale?.end_at;
      if (end_at) {
        const remaining = parseInt(end_at) - nowTime;

        let left = "Ended";
        if (remaining > 0) {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remaining / 1000 / 60) % 60);
          const seconds = Math.floor((remaining / 1000) % 60);

          if (days > 0)
            left =
              days +
              "Days " +
              hours +
              " Hours " +
              minutes +
              " Minutes " +
              seconds +
              " Seconds";
          else
            left =
              hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
        }

        lefts.push(left);
      }
    }
    setTimeLeft(lefts);
  }

  const handleOnClick = (name: string, nftid: string) => {
    setShowModal({ name, nftid, loading: true });
    saleNFTsQuery.refetch();
  };

  return (
    <>
      <div className={css.nft_header}>
        <div className={css.desc}>
          <a
            href="https://explorer.testnet.near.org/accounts/nft.cheddar.testnet"
            title="Cheddar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cheddar
          </a>
        </div>
      </div>
      <div className="container">
        <div className="dlion">
          <div className={css.nft_tokens}>
            <>
              {nfts.map((nft, index) => {
                return (
                  <div className={css.nft_token} key={nft.token.token_id}>
                    <img
                      alt="NFT"
                      src={
                        "https://bafybeibghcllcmurku7lxyg4wgxn2zsu5qqk7h4r6bmyhpztmyd564cx54.ipfs.nftstorage.link/" +
                        nft.token.metadata?.media
                      }
                      onClick={(e) =>
                        handleOnClick("NFTDetail", nft.token.token_id)
                      }
                    />
                    <div className={css.nft_token_info}>
                      <div style={{ display: "flex" }}>
                        <div>
                          <b className="title">NFT Id: {nft.token.token_id}</b>
                          <br />
                          {timeLeft && (
                            <>
                              <b className="title">{timeLeft![index]}</b>
                              <br />
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex" }}>
                        {timeLeft &&
                          timeLeft![index] != "Ended" &&
                          nft.token.owner_id != Tenk?.account.accountId && (
                            <div style={{ alignSelf: "flex-end" }}>
                              <button
                                className="purple"
                                onClick={() =>
                                  handleOnClick(
                                    "AuctionBid",
                                    nft.token.token_id
                                  )
                                }
                              >
                                Place Bid
                              </button>
                            </div>
                          )}
                        {timeLeft && timeLeft![index] == "Ended" && (
                          <div style={{ alignSelf: "flex-end" }}>
                            <button
                              className="purple"
                              onClick={() =>
                                handleOnClick("AuctionView", nft.token.token_id)
                              }
                            >
                              View Auction
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        </div>
      </div>
      <NFTModal show={showModal} setShow={setShowModal} />
    </>
  );
};
