

const { expect } = require("chai");
const { ethers } = require("hardhat");





  let GiversToken;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let initialLiquidty;
  let supply;
  let pair
  
  
  describe("Givers Chain", function () {

    beforeEach(async function () {
      
      GiversToken =  await ethers.getContractFactory("GiversChain");

      [owner, addr1, addr2, addr3, addr4,addr5,addr6,...addrs] = await ethers.getSigners();

      hardhatToken = await GiversToken.deploy(addr1.address,addr2.address,process.env.ROUTER02);
      await hardhatToken.deployed()

        //add liquidty
        this.provider = ethers.provider;

        const factory = new ethers.Contract()

        const router02 = new ethers.Contract(
          process.env.ROUTER02,
          ['function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)', 'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)', 'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)', 'function swapExactTokensForETHSupportingFeeOnTransferTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external'], 
          this.provider);
         const routerSinger = router02.connect(owner)

         await hardhatToken.approve(process.env.ROUTER02, ethers.utils.parseEther("10000000"));

         initialLiquidty = ethers.utils.parseEther('10000000')
         const eTH = 5
         await routerSinger.addLiquidityETH(
           hardhatToken.address,
           initialLiquidty,
           0,
           eTH,
           addr1.address,
           Math.floor(Date.now() / 1000) + 60 * 10,
           {value : ethers.utils.parseEther("200")}
           )

            
            

    })
    /**
    describe("Deployment", function () {

        it("Should set the right supply amount",async function (){
            expect(await hardhatToken.totalSupply()).to.equal(ethers.utils.parseEther('1000000000'))
        })

        it("Should assign the total supply of tokens to the owner", async function () {
          const ownerBalance = await hardhatToken.balanceOf(owner.address);
          expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
        });

      });

    describe("Transfers:Before swapAndLiquify is enabled", function () {

      it("Should transfer with no fee for excluded accounts ", async function () {
        // Transfer 50 tokens from owner to addr1

        //await hardhatToken.excludeFromFee(owner.address)
        await hardhatToken.excludeFromFee(addr1.address)
        await hardhatToken.excludeFromFee(addr2.address)
        const amount =ethers.utils.parseEther('50') 

        await hardhatToken.transfer(addr1.address,amount );
        const addr1Balance = await hardhatToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal( amount);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr1).transfer(addr2.address, amount);
        const addr2Balance = await hardhatToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(amount);

        //Treansfer back to owner  
        await hardhatToken.connect(addr2).transfer(owner.address, amount);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);

      });

      it("Should transfer with fee for included accounts ", async function () {

        //check reflection supply && true supply
        supply = await hardhatToken._getCurrentSupply()
        const {0: rsupply, 1: tsupply} = supply
        const rate = await hardhatToken._getRate()
        expect(rsupply > tsupply)
    

        // Transfer'50' tokens from owner to addr3 (expect balance of addr3 to be equal to'50')
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50'));
        const addr3Balance = await hardhatToken.balanceOf(addr3.address);
        expect(addr3Balance ).to.equal(ethers.utils.parseEther('50'));

        //Transfer'50' tokens from addr3 to addr4 (expect a fee of 10%)
        //We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50'));
        const addr3Balance2 = await hardhatToken.balanceOf(addr3.address)
        const addr4Balance = await hardhatToken.balanceOf(addr4.address);
        const reflect = (addr4Balance - ethers.utils.parseEther('45'))/ethers.utils.parseEther('45')
        expect(0).to.be.equal(addr3Balance2)
        expect(true).to.be.equals(reflect > 0 && reflect < 2 )

        //Transfer 30 tokens from addr4 to addr5 (expect a fee of 10%)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30'));
        const addr4Balance2 = await hardhatToken.balanceOf(addr4.address);
        const addr5Balance = await hardhatToken.balanceOf(addr5.address);
        const reflection2 = (addr5Balance - ethers.utils.parseEther('27'))/ethers.utils.parseEther('27')

        expect(true).to.be.equal(ethers.utils.parseEther('15') < addr4Balance2 && addr4Balance2 < ethers.utils.parseEther('16'));
        expect(true).to.be.equal(reflection2 > 0 && reflection2 < 2)

        //Transfer 20 tokens from addr5 to addr6 (expect a fee of 10%)
        await hardhatToken.connect(addr5).transfer(addr6.address, ethers.utils.parseEther('20'));
        const addr5Balance2 = await hardhatToken.balanceOf(addr5.address);
        const addr6Balance = await hardhatToken.balanceOf(addr6.address);
        const reflection3 = (addr6Balance - ethers.utils.parseEther('27'))/ethers.utils.parseEther('27')

        expect(true).to.equal(ethers.utils.parseEther('7') < addr5Balance2 && addr5Balance2 < ethers.utils.parseEther('8'));
        expect(true).to.equal(0 > reflection3 && reflection3 < 3)
        
      });

      it('Should not send fee to Charity and marketing wallet', async function () {
      
        //get Charitywallet and MarketingWallet balance before transfer
        const charityWalletBefore = await hardhatToken.balanceOf(addr1.address)
        const MarketingWalletBefore = await hardhatToken.balanceOf(addr2.address)

        //Transfer from owner to  addr3 to addr4 (expect charges of 0%)
        await hardhatToken.transfer(addr3.address, 150)
        await hardhatToken.connect(addr3).transfer(addr4.address,100)

        //get Charitywallet and MarketingWallet balance after transfer
        const charityWalletAfter = await hardhatToken.balanceOf(addr1.address)
        const MarketingWalletAfter = await hardhatToken.balanceOf(addr2.address)
        
        const  marketingDiff= MarketingWalletAfter - MarketingWalletBefore
        const  charityDiff= charityWalletAfter - charityWalletBefore
        
        expect(marketingDiff).to.be.equal(0)
        expect(charityDiff).to.be.equal(0)

      })

      it('should send fee to burn wallent', async function () {

       const burnBalanceBefore = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

       // Transfer'200' tokens from owner to addr3 (expect balance of addr3 to be equal to'200')
       await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('200'));
       const addr3Balance = await hardhatToken.balanceOf(addr3.address);
       expect(addr3Balance ).to.equal(ethers.utils.parseEther('200'));
       expect(burnBalanceBefore).to.be.equal(0)

       //Transfer'200' tokens from addr3 to addr4 (expect 1% (2) is sent to burn wallent)
       await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('200'));
       const burnBalanceAfter = await hardhatToken.balanceOf('0x000000000000000000000000000000000000dEaD')

       
       expect(true).to.be.equal(burnBalanceAfter > ethers.utils.parseEther('2') && burnBalanceAfter < ethers.utils.parseEther('3') )

        

      })
    
    });
    */

    describe('Transfers:After swapAndLiquify is enabled', function(){

      it("Should transfer with no fee for excluded accounts ", async function () {
        // Transfer 50,000,000 tokens from owner to addr1

        //await hardhatToken.excludeFromFee(owner.address)
        await hardhatToken.excludeFromFee(addr1.address)
        await hardhatToken.excludeFromFee(addr2.address)
        const amount =ethers.utils.parseEther('50000000') 

        await hardhatToken.transfer(addr1.address,amount );
        const addr1Balance = await hardhatToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal( amount);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await hardhatToken.connect(addr1).transfer(addr2.address, amount);
        const addr2Balance = await hardhatToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(amount);

        //Treansfer back to owner  
        await hardhatToken.connect(addr2).transfer(owner.address, amount);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);

        //expect balance to be equal  to totalsupply sub initialLiquidty
        expect(ethers.utils.parseEther('990000000')).to.equal(ownerBalance);

      });

      it("Should transfer with fee for included accounts ", async function () {

        //check reflection supply && true supply
        supply = await hardhatToken._getCurrentSupply()
        const {0: rsupply, 1: tsupply} = supply
        expect(rsupply > tsupply)

        const {0: amountToken, 1: amountETH, 2: liquidity} = pair

        expect(initialLiquidty).to.be.equal(liquidity)
            //expect(ethers.utils.parseEther("200")).to.be.equal(amountETH)

        // Transfer'50,000,000' tokens from owner to addr3 (expect balance of addr3 to be equal to'50,000,000')
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50000000'));
        const addr3Balance = await hardhatToken.balanceOf(addr3.address);
        expect(addr3Balance ).to.equal(ethers.utils.parseEther('50000000'));

        //Transfer'50,000,000' tokens from addr3 to addr4 (expect a fee of 10%)
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50000000'));
        const addr3Balance2 = await hardhatToken.balanceOf(addr3.address)
        const addr4Balance = await hardhatToken.balanceOf(addr4.address);
        const reflect = (addr4Balance - ethers.utils.parseEther('45000000'))/ethers.utils.parseEther('5000000')

        expect(0).to.be.equal(addr3Balance2)
        expect(true).to.be.equals(reflect > 0 && reflect < 3 )
        expect(45).to.be.equal(Math.round(addr4Balance/10**24))


        //Transfer 30,000,000 tokens from addr4 to addr5 (expect a fee of 10%)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30000000'));
        const addr4Balance2 = await hardhatToken.balanceOf(addr4.address);
        const addr5Balance = await hardhatToken.balanceOf(addr5.address);
        const reflection2 = (addr5Balance - ethers.utils.parseEther('27000000'))/ethers.utils.parseEther('30000000')

        expect(true).to.be.equal(ethers.utils.parseEther('15000000') < addr4Balance2 && addr4Balance2 < ethers.utils.parseEther('16000000'));
        expect(true).to.be.equal(reflection2 > 0 && reflection2 < 3)
        expect(27).to.be.equal(Math.round(addr5Balance/10**24))

        //Transfer 20,000,000 tokens from addr5 to addr6 (expect a fee of 10%)
        await hardhatToken.connect(addr5).transfer(addr6.address, ethers.utils.parseEther('20000000'));
        const addr5Balance2 = await hardhatToken.balanceOf(addr5.address);
        const addr6Balance = await hardhatToken.balanceOf(addr6.address);
        const reflection3 = (addr6Balance - ethers.utils.parseEther('18000000'))/ethers.utils.parseEther('20000000')

        expect(true).to.equal(ethers.utils.parseEther('7000000') < addr5Balance2 && addr5Balance2 < ethers.utils.parseEther('8000000'));
        expect(true).to.equal(0 < reflection3 && reflection3 < 3)
        expect(18).to.be.equal(Math.round(addr6Balance/10**24))

      });

      it('Should send fee to Charity and marketing wallet', async function () {
      
        //get Charitywallet,MarketingWallet and this contract balances in before transfer
        const charityBalanceBefore = await this.provider.getBalance(addr1.address)
        const marketingBalanceBefore = await this.provider.getBalance(addr2.address)
        const tokenContractBalanceBefore = await this.provider.getBalance(hardhatToken.address)
        expect(true).to.be.equal(charityBalanceBefore < marketingBalanceBefore && tokenContractBalanceBefore < marketingBalanceBefore)
       

        // Transfer'50,000,000' tokens from owner to addr3 
        await hardhatToken.transfer(addr3.address, ethers.utils.parseEther('50000000')); 
        //Transfer'50,000,000' tokens from addr3 to addr4 (unlock swap and Liquidfy)
        await hardhatToken.connect(addr3).transfer(addr4.address, ethers.utils.parseEther('50000000'));
        //Transfer 30,000,000 tokens from addr4 to addr5 (trigger swapand Liquidfy)
        await hardhatToken.connect(addr4).transfer(addr5.address, ethers.utils.parseEther('30000000'));

      
         //get Charitywallet, MarketingWallet and Tokencontract balance after swap
         const charityBalanceAfter = await this.provider.getBalance(addr1.address)
         const marketingBalanceAfter = await this.provider.getBalance(addr2.address)
         const tokenContractBalanceAfter = await this.provider.getBalance(hardhatToken.address)
        
         const  marketingDiff= (marketingBalanceAfter - marketingBalanceBefore)/10**18
         const  charityDiff= (charityBalanceAfter - charityBalanceBefore)/10**18
         const tokenDiff= (tokenContractBalanceAfter - tokenContractBalanceBefore)/10**18
        
        expect(8).to.be.equal(Math.round(marketingDiff))
        expect(2).to.be.equal(Math.round(charityDiff))
        expect(0).to.be.equal(tokenDiff)

      });
    
    }) 

    // it('should remove liquidity', async function(){
    //   await this.routerSinger.removeLiquidityETHSupportingFeeOnTransferTokens(
    //     address token,
    //     uint liquidity,
    //     uint amountTokenMin,
    //     uint amountETHMin,
    //     address to,
    //     uint deadline
    //   ) 
    // }) 
     

  })
