/*
Copyright (c) 2017, Dogan Yazar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict'

import { PorterStemmerSv as stemmer } from 'lib/natural'
import { words, stemmedWords } from '../spec/test_data/sv_stemmer_sample.js'

describe('porter_stemmer_sv', function () {
  it('Stem whole sample data', function () {
    const res = words.map(w => stemmer.stem(w))
    expect(res).toEqual(stemmedWords)
  })

  /*
  it('should tokenize and stem attached', function() {
    stemmer.attach();
    expect('björks jaktbössa'.tokenizeAndStem()).toEqual(['björk', 'jaktböss'])
    expect('bJöRks JaKtböSsa'.tokenizeAndStem()).toEqual(['björk', 'jaktböss'])
  })
  */
})
