# NodeCopier

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-online-green.svg)](https://github.com/MetaRPC/NodeCopier/tree/main/docs)

Official Node.js SDK for the MetaRPC Trade Copier high-performance trade replication engine via gRPC (`copy.mrpc.pro:443`).

## Installation

```bash
npm install @metarpc/nodecopier
```

## 🏃 How to Run Examples

Clone the repository and run the trade copier example out-of-the-box:

```bash
git clone https://github.com/MetaRPC/NodeCopier.git
cd NodeCopier
npm install

# 1. Run with default TRIAL key:
node examples/quickstart.js

# 2. Or pass your MetaRPC API key directly as an argument:
node examples/quickstart.js your_api_key_here

# 3. Or use the MRPC_API_KEY environment variable:
export MRPC_API_KEY="your_api_key_here"        # Windows CMD: set MRPC_API_KEY=your_api_key_here
node examples/quickstart.js                    # Windows PowerShell: $env:MRPC_API_KEY="your_api_key_here"
```

## Quick Start

See [Quick Start Documentation](https://github.com/MetaRPC/NodeCopier/blob/main/docs/All_Guides/Your_First_Project.md) for a 10-minute walkthrough.
