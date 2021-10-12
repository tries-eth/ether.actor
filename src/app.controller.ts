import { isAddress } from '@ethersproject/address';
import { CacheTTL, Controller, Get, NotFoundException, Param, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:contract/:fnname*')
  @CacheTTL(25)
  async getContractCall(
    @Param('contract') contract: string,
    @Param('fnname') fnname: string,
    @Req() req: any,
  ): Promise<any> {
    let args = [];
    if (req.params['0'] && req.params['0'].length > 1) {
      args = req.params['0'].substr(1).split('/');
    }

    return this.appService.getContractData(contract, fnname, args);
  }

  @Get('/:contract')
  async getAbiCall(@Param('contract') contract: string): Promise<object> {
    if (!isAddress(contract)) {
      throw new NotFoundException({statusCode: 404}, 'Contract not found');
    }
    return {abi: await this.appService.getAbi(contract)};
  }

  @Get('/')
  getHomepage(): string {
    return `
<!DOCTYPE HTML>
<html>
<head>
<title>ether.actor</title>
<style>
body {
  font-family: helvetica;
  max-width: 500px;
  margin: 10vh auto;
  color: #333;
}
li {
  margin-bottom: 20px;
}
</style>
</head>
<body>
<h2>super simple ethereum -> http bridge for fetching contract info</h2>
<p>powered by etherscan for ABIs and cloudflare for ethereum endpoints<p>
<br />
<p>try it:</p>
<ul>
<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63">/0xcontract</a><br />
returns the ABI of the given contract</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenURI/23">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenSvgDataOf/233">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call (works for media too)</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0x18C8dF1fb7FB44549F90d1C2BB1DC8b690CD0559/0x18C2dF1fb7FB44549F90d1C2BB1DC8b690CD0559">/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0xADDRESS0/0xADDRESS1</a>
<br />works with booleans and multiple arguments.
</ul>

</body>
</html>
    `;
  }
}
