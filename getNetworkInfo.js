const {promisify} = require('util');

const {getNetworkInfo} = require('./');

/** Get network info

  {
    lnd: <LND GRPC API Object>
  }

  @returns via Promise
  {
    average_channel_size: <Tokens Number>
    channel_count: <Channels Count Number>
    max_channel_size: <Tokens Number>
    min_channel_size: <Tokens Number>
    node_count: <Node Count Number>
    total_capacity: <Total Capacity Number>
    type: <Type String>
  }
*/
module.exports = promisify(getNetworkInfo);

