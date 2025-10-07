import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface NFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  owner: string;
  price?: number;
  isListed: boolean;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export const MarketplacePage: React.FC = () => {
  const { isConnected, walletAddress, user, connectWallet } = useWeb3();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'marketplace' | 'my-nfts'>('marketplace');
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => ['all', 'Weapons', 'Characters', 'Items', 'Skins', 'Accessories'], []);
  const rarities = useMemo(() => ['all', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], []);

  const getRarityBasePrice = (rarity: string): number => {
    switch (rarity) {
      case 'Common': return 10;
      case 'Uncommon': return 25;
      case 'Rare': return 50;
      case 'Epic': return 100;
      case 'Legendary': return 250;
      default: return 10;
    }
  };

  const getRandomEmoji = (category: string): string => {
    const emojis = {
      'Weapons': ['⚔️', '🗡️', '🏹', '🔫', '⚡'],
      'Characters': ['🧙', '🦸', '👑', '🤖', '👹'],
      'Items': ['💎', '🔮', '📿', '🏆', '⭐'],
      'Skins': ['🎨', '🌈', '✨', '🎭', '🦄'],
      'Accessories': ['👑', '💍', '📿', '🎀', '🔗']
    };
    const categoryEmojis = emojis[category as keyof typeof emojis] || ['🎮'];
    return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  };

  const generateMockNFTs = useCallback((): NFT[] => {
    const mockNFTs = [];
    const names = [
      'Dragon Sword', 'Phoenix Shield', 'Lightning Staff', 'Shadow Cloak',
      'Crystal Armor', 'Fire Gauntlets', 'Ice Crown', 'Wind Boots',
      'Earth Hammer', 'Water Orb', 'Mystic Ring', 'Power Gem'
    ];
    
    for (let i = 1; i <= 24; i++) {
      const rarity = rarities[Math.floor(Math.random() * (rarities.length - 1)) + 1] as NFT['rarity'];
      const category = categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
      const basePrice = getRarityBasePrice(rarity);
      
      mockNFTs.push({
        tokenId: i,
        name: names[i % names.length] + ` #${i}`,
        description: `A powerful ${rarity.toLowerCase()} ${category.toLowerCase()} with unique abilities`,
        image: getRandomEmoji(category),
        rarity,
        category,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        price: basePrice + Math.random() * basePrice,
        isListed: true,
        attributes: [
          { trait_type: 'Level', value: Math.floor(Math.random() * 20) + 1 },
          { trait_type: 'Power', value: Math.floor(Math.random() * 2000) + 100 },
          { trait_type: 'Durability', value: Math.floor(Math.random() * 100) + 50 }
        ]
      });
    }
    
    return mockNFTs;
  }, [categories, rarities]);

  const generateMockUserNFTs = useCallback((): NFT[] => {
    return [
      {
        tokenId: 101,
        name: 'Epic Sword #101',
        description: 'Your legendary weapon',
        image: '⚔️',
        rarity: 'Epic',
        category: 'Weapons',
        owner: walletAddress || '',
        isListed: false,
        attributes: [
          { trait_type: 'Level', value: 15 },
          { trait_type: 'Power', value: 850 }
        ]
      },
      {
        tokenId: 102,
        name: 'Rare Shield #102',
        description: 'Protective gear',
        image: '🛡️',
        rarity: 'Rare',
        category: 'Items',
        owner: walletAddress || '',
        isListed: false,
        attributes: [
          { trait_type: 'Level', value: 8 },
          { trait_type: 'Defense', value: 420 }
        ]
      }
    ];
  }, [walletAddress]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setNfts(generateMockNFTs());
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [generateMockNFTs]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/web3/nft/${walletAddress}`);
        const data = await response.json();
        
        if (data.success) {
          const formattedNFTs = data.data.nfts.map((nft: { tokenId: number; name: string; rarity: string; image: string; attributes?: Array<{ trait_type: string; value: string | number }> }) => ({
            ...nft,
            owner: walletAddress,
            isListed: false,
            description: `A unique ${nft.rarity} NFT from the CADEM collection`,
            category: 'Items',
            attributes: nft.attributes || [
              { trait_type: 'Level', value: Math.floor(Math.random() * 10) + 1 },
              { trait_type: 'Power', value: Math.floor(Math.random() * 1000) + 100 }
            ]
          }));
          setUserNFTs(formattedNFTs);
        }
      } catch (error) {
        console.error('Error fetching user NFTs:', error);
        setUserNFTs(generateMockUserNFTs());
      }
    };

    if (isConnected && walletAddress) {
      fetchUserData();
    }
  }, [isConnected, walletAddress, generateMockUserNFTs]);




  const filteredNFTs = (viewMode === 'marketplace' ? nfts : userNFTs)
    .filter(nft => selectedCategory === 'all' || nft.category === selectedCategory)
    .filter(nft => selectedRarity === 'all' || nft.rarity === selectedRarity)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'rarity': {
          const rarityOrder = { 'Legendary': 5, 'Epic': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        }
        case 'newest':
        default:
          return b.tokenId - a.tokenId;
      }
    });

  const handleBuyNFT = async (nft: NFT) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    // In a real implementation, this would interact with smart contracts
    alert(`Buying ${nft.name} for ${nft.price} CADEM tokens!\n\nThis is a demo - in production, this would execute a blockchain transaction.`);
  };

  const handleListNFT = async (nft: NFT) => {
    const price = prompt('Enter listing price in CADEM tokens:');
    if (price && !isNaN(Number(price))) {
      // In a real implementation, this would list the NFT on the marketplace
      alert(`Listed ${nft.name} for ${price} CADEM tokens!\n\nThis is a demo - in production, this would create a marketplace listing.`);
    }
  };

  const mintNewNFT = async () => {
    if (!isConnected || !walletAddress) {
      await connectWallet();
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/blockchain/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: walletAddress,
          name: `Random NFT #${Date.now()}`,
          rarity: rarities[Math.floor(Math.random() * (rarities.length - 1)) + 1],
          image: '🎁'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('🎉 NFT minted successfully!');
        // Refresh user NFTs after minting
        if (isConnected && walletAddress) {
          const response = await fetch(`http://localhost:3000/api/web3/nft/${walletAddress}`);
          const data = await response.json();
          
          if (data.success) {
            const formattedNFTs = data.data.nfts.map((nft: { tokenId: number; name: string; rarity: string; image: string; attributes?: Array<{ trait_type: string; value: string | number }> }) => ({
              ...nft,
              owner: walletAddress,
              isListed: false,
              description: `A unique ${nft.rarity} NFT from the CADEM collection`,
              category: 'Items',
              attributes: nft.attributes || [
                { trait_type: 'Level', value: Math.floor(Math.random() * 10) + 1 },
                { trait_type: 'Power', value: Math.floor(Math.random() * 1000) + 100 }
              ]
            }));
            setUserNFTs(formattedNFTs);
          }
        }
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Please try again.');
    }
  };

  if (!isConnected && viewMode === 'my-nfts') {
    return (
      <div className="page-container bg-gaming-gradient flex items-center justify-center">
        <div className="content-wrapper">
          <div className="card-gaming max-w-md mx-auto text-center">
            <h1 className="heading-lg mb-6">
              Connect Your Wallet
            </h1>
            <p className="text-gray-300 mb-8 text-sm sm:text-base">
              Connect your wallet to view your NFT collection and access the marketplace.
            </p>
            <button onClick={connectWallet} className="btn-primary w-full">
              🔗 Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="marketplace-header">
          <h1 className="marketplace-title">
            🛒 NFT Marketplace
          </h1>
          <p className="marketplace-subtitle">
            Discover, collect, and trade unique gaming NFTs in the CADEM ecosystem
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <div className="toggle-container">
            <button
              onClick={() => setViewMode('marketplace')}
              className={`toggle-button ${viewMode === 'marketplace' ? 'active' : ''}`}
            >
              🛒 Marketplace
            </button>
            <button
              onClick={() => setViewMode('my-nfts')}
              className={`toggle-button ${viewMode === 'my-nfts' ? 'active' : ''}`}
            >
              🎨 My NFTs
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="filter-select"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'All Rarities' : rarity}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'rarity' | 'newest')}
                className="filter-select"
              >
                <option value="newest">Newest</option>
                <option value="price">Price (High to Low)</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>

            {viewMode === 'my-nfts' && (
              <div className="filter-group">
                <button
                  onClick={mintNewNFT}
                  className="mint-button"
                >
                  🎁 Mint NFT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats with Live Data */}
        <div className="stats-overview">
          <div className="stat-overview-card">
            <div className="stat-icon">🎨</div>
            <div className="stat-overview-value">
              {viewMode === 'marketplace' ? nfts.length : userNFTs.length}
            </div>
            <div className="stat-overview-label">
              {viewMode === 'marketplace' ? 'Listed NFTs' : 'Owned NFTs'}
            </div>
            <div className="stat-trend">📈 +12% this week</div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-icon">💰</div>
            <div className="stat-overview-value">
              {user?.currentCademBalance?.toFixed(0) || '0'}
            </div>
            <div className="stat-overview-label">CADEM Balance</div>
            <div className="stat-trend">💎 Ready to trade</div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-overview-value">
              {filteredNFTs.filter(nft => nft.rarity === 'Legendary').length}
            </div>
            <div className="stat-overview-label">Legendary Items</div>
            <div className="stat-trend">🔥 Ultra rare</div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-icon">📊</div>
            <div className="stat-overview-value">
              {Math.floor(Math.random() * 50) + 10}
            </div>
            <div className="stat-overview-label">Floor Price</div>
            <div className="stat-trend">📉 -5% today</div>
          </div>
        </div>

        {/* Market Activity Feed */}
        <div className="market-activity">
          <h3 className="activity-title">🔥 Recent Activity</h3>
          <div className="activity-feed">
            <div className="activity-item">
              <span className="activity-emoji">💰</span>
              <span className="activity-text">Dragon Sword #12 sold for 150 CADEM</span>
              <span className="activity-time">2m ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-emoji">🎨</span>
              <span className="activity-text">New Legendary NFT minted!</span>
              <span className="activity-time">5m ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-emoji">🏆</span>
              <span className="activity-text">Phoenix Shield #7 listed for 200 CADEM</span>
              <span className="activity-time">8m ago</span>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="loading-card">
                <div className="loading-image"></div>
                <div className="loading-text"></div>
                <div className="loading-text short"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="nft-grid">
            {filteredNFTs.map((nft) => (
              <div key={nft.tokenId} className="nft-card">
                {/* NFT Image */}
                <div className="nft-image-container">
                  {nft.image}
                </div>

                {/* NFT Info */}
                <div className="nft-details">
                  <div>
                    <h3 className="nft-name">{nft.name}</h3>
                    <p className="nft-description">{nft.description}</p>
                  </div>

                  <div className="nft-meta">
                    <span className={`rarity-badge rarity-${nft.rarity.toLowerCase()}`}>
                      {nft.rarity}
                    </span>
                    <span className="nft-category">{nft.category}</span>
                  </div>

                  {/* Attributes */}
                  <div className="nft-attributes">
                    {nft.attributes.slice(0, 2).map((attr, index) => (
                      <div key={index} className="attribute-item">
                        <div className="attribute-type">{attr.trait_type}</div>
                        <div className="attribute-value">{attr.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="nft-action-section">
                    {viewMode === 'marketplace' ? (
                      <>
                        <div className="price-section">
                          <div className="price-label">Price</div>
                          <div className="price-value">
                            {nft.price?.toFixed(0)} CADEM
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyNFT(nft)}
                          className="nft-action-button"
                        >
                          💰 Buy
                        </button>
                      </>
                    ) : (
                      <>
                        {nft.isListed ? (
                          <div className="listed-status">✅ Listed</div>
                        ) : null}
                        <button
                          onClick={() => handleListNFT(nft)}
                          className="nft-action-button secondary"
                        >
                          🏷️ List for Sale
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredNFTs.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">🎨</div>
            <h3 className="empty-state-title">
              {viewMode === 'marketplace' ? 'No NFTs found' : 'No NFTs in your collection'}
            </h3>
            <p className="empty-state-description">
              {viewMode === 'marketplace' 
                ? 'Try adjusting your filters to see more NFTs'
                : 'Start playing games or visit the marketplace to get your first NFTs'
              }
            </p>
            {viewMode === 'my-nfts' && (
              <button onClick={mintNewNFT} className="btn-primary">
                🎁 Mint Your First NFT
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
