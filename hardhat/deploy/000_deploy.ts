import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployer} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;

  const accountManagerInfo = await deploy('AccountManager', {
    from: deployer,
    log: true,
    autoMine: true,
  });

  const itemInfo = await deploy('Item', {
    from: deployer,
    log: true,
    autoMine: true,
    args: ['Item', 'ITEM'],
  });

  const characterInfo = await deploy('Character', {
    from: deployer,
    log: true,
    autoMine: true,
    args: ['Character', 'CHARACTER', itemInfo.address],
  });

  await deploy('Logic', {
    from: deployer,
    log: true,
    autoMine: true,
    args: [accountManagerInfo.address, itemInfo.address, characterInfo.address],
  });

};
export default func;
