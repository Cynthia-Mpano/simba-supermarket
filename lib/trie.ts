import type { Product } from './types';

class TrieNode {
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;
  productData: Product | null;

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.productData = null;
  }
}

export class ProductTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(productName: string, product: Product) {
    let node = this.root;
    let word = productName.toLowerCase();
    
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.productData = product;
  }

  searchPrefix(prefix: string): Product[] {
    let node = this.root;
    let word = prefix.toLowerCase();
    
    for (let char of word) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this._collectAllWords(node, []);
  }

  private _collectAllWords(node: TrieNode, results: Product[]): Product[] {
    if (node.isEndOfWord && node.productData) {
      results.push(node.productData);
    }
    for (let char in node.children) {
      this._collectAllWords(node.children[char], results);
    }
    return results;
  }
}
