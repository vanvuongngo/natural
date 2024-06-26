/*
Copyright (c) 2012, Guillaume Marty

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

import {
  normalizeJa,
  Converters
} from 'lib/natural'
const converters = new Converters()

describe('normalizeJa', function () {
  it('should fix badly formed hiragana', function () {
    expect(normalizeJa('う゛か゛き゛く゛は゜ひ゜ふ゜')).toEqual('ゔがぎぐぱぴぷ')
    expect(normalizeJa('うﾞかﾞきﾞくﾞはﾟひﾟふﾟ')).toEqual('ゔがぎぐぱぴぷ')
    expect(normalizeJa('まっなか')).toEqual('まんなか')
  })

  it('should fix badly formed fullwidth katakana', function () {
    expect(normalizeJa('ウ゛カ゛キ゛ク゛ハ゜ヒ゜フ゜')).toEqual('ヴガギグパピプ')
    expect(normalizeJa('ウﾞカﾞキﾞクﾞハﾟヒﾟフﾟ')).toEqual('ヴガギグパピプ')
  })

  it('should fix badly formed halfwidth katakana', function () {
    expect(normalizeJa('ｳ゛ｶ゛ｷ゛ｸ゛ﾊ゜ﾋ゜ﾌ゜')).toEqual('ヴガギグパピプ')
    expect(normalizeJa('ｳﾞｶﾞｷﾞｸﾞﾊﾟﾋﾟﾌﾟ')).toEqual('ヴガギグパピプ')
  })

  it('should transform halfwidth katakana to fullwidth', function () {
    expect(normalizeJa('ｶﾀｶﾅ')).toEqual('カタカナ')
  })

  it('should transform fullwidth alphanumerical characters to halfwidth', function () {
    expect(normalizeJa('ＡＢＣ１２３')).toEqual('ABC123')
  })

  it('should transform fullwidth spaces to halfwidth', function () {
    expect(normalizeJa('空　空　空')).toEqual('空 空 空')
  })

  it('should transform halfwidth punctuation signs to fullwidth', function () {
    // Taken from http://unicode.org/cldr/trac/browser/trunk/common/main/ja.xml
    expect(normalizeJa('〜 ・ ･ 、､ 。｡ 「｢ 」｣'))
      .toEqual('〜 ・ ・ 、、 。。 「「 」」')
  })

  it('should transform fullwidth symbols to halfwidth', function () {
    // Taken from http://unicode.org/cldr/trac/browser/trunk/common/main/ja.xml
    expect(normalizeJa('‾ _＿ -－ ‐ — ― ,， ;； :： !！ ?？ .． ‥ … ＇＼ ‘ ’ "＂ “ ” (（ )） [［ ]］ {｛ }｝ 〈 〉 《 》 『 』 【 】 〔 〕 ‖ § ¶ @＠ +＋ ^＾ $＄ *＊ /／ ＼\\ &＆ #＃ %％ ‰ † ‡ ′ ″ 〃 ※'))
      .toEqual('‾ __ -- ‐ — ― ,, ;; :: !! ?? .. ‥ … ＇\\ ‘ ’ "" “ ” (( )) [[ ]] {{ }} 〈 〉 《 》 『 』 【 】 〔 〕 ‖ § ¶ @@ ++ ^^ $$ ** // \\\\ && ## %% ‰ † ‡ ′ ″ 〃 ※')
  })

  it('should replace repeat characters', function () {
    expect(normalizeJa('時々刻々')).toEqual('時時刻刻')
    expect(normalizeJa('甲斐々々しい')).toEqual('甲斐甲斐しい')
  })

  it('should replace composite symbols', function () {
    expect(normalizeJa('㍼54年㋃㏪')).toEqual('昭和54年4月11日')
    expect(normalizeJa('㍧〜㍬')).toEqual('15点〜20点')
    expect(normalizeJa('カンパニー㍿')).toEqual('カンパニー株式会社')
    expect(normalizeJa('100㌫')).toEqual('100パーセント')
    expect(normalizeJa('70㌔')).toEqual('70キロ')
    expect(normalizeJa('㍇')).toEqual('マンション')
  })
})

const sample = 'ABC ＡＢＣ　123１２３.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ'

describe('converters', function () {
  it('should all be reversible', function () {
    const sample = '半角カナ（はんかくカナ）とは、JIS X 0208など片仮名を含む他の文字集合と同時に運用される場合におけるJIS X 0201の片仮名文字集合の通称である。漢字を含む文字集合で定義された片仮名に対して、半分の文字幅で表示されることが一般的であったためこのように呼ばれる。JIS X 0201で規定される8ビット符号化およびShift_JISにおいて0xA1-0xDFの範囲の1バイト文字がこれにあたる。また、Shift_JISやEUC-JPなどの符号化方式やUnicodeでも互換性の目的でこの文字集合をもっている。'
    expect(converters.alphabetHF(converters.alphabetFH(sample))).toEqual(converters.alphabetHF(sample))
    expect(converters.alphabetFH(converters.alphabetHF(sample))).toEqual(converters.alphabetFH(sample))
    expect(converters.numbersHF(converters.numbersFH(sample))).toEqual(converters.numbersHF(sample))
    expect(converters.numbersFH(converters.numbersHF(sample))).toEqual(converters.numbersFH(sample))
    expect(converters.punctuationHF(converters.punctuationFH(sample))).toEqual(converters.punctuationHF(sample))
    expect(converters.punctuationFH(converters.punctuationHF(sample))).toEqual(converters.punctuationFH(sample))
    expect(converters.katakanaHF(converters.katakanaFH(sample))).toEqual(converters.katakanaHF(sample))
    expect(converters.katakanaFH(converters.katakanaHF(sample))).toEqual(converters.katakanaFH(sample))
  })

  describe('.fullwidthToHalfwidth', function () {
    describe('.alphabet', function () {
      it('should transform fullwidth roman characters and space to halfwidth', function () {
        expect(converters.alphabetFH(sample)).toEqual('ABC ABC 123１２３.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.numbers', function () {
      it('should transform fullwidth numerical characters to halfwidth', function () {
        expect(converters.numbersFH(sample)).toEqual('ABC ＡＢＣ　123123.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.punctuation', function () {
      it('should transform fullwidth punctuation signs to halfwidth', function () {
        expect(converters.punctuationFH(sample)).toEqual('ABC ＡＢＣ　123１２３.,-.,-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.katakana', function () {
      it('should transform fullwidth katakana to halfwidth', function () {
        expect(converters.katakanaFH(sample)).toEqual('ABC ＡＢＣ　123１２３.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟｳﾞｶｷｸｹｺﾊﾊﾞﾊﾟ')
      })
    })
  })

  describe('.halfwidthToFullwidth', function () {
    describe('.alphabet', function () {
      it('should transform halfwidth roman characters and space to fullwidth', function () {
        expect(converters.alphabetHF(sample)).toEqual('ＡＢＣ　ＡＢＣ　123１２３.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.numbers', function () {
      it('should transform halfwidth numerical characters to fullwidth', function () {
        expect(converters.numbersHF(sample)).toEqual('ABC ＡＢＣ　１２３１２３.,-．，-ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.punctuation', function () {
      it('should transform halfwidth punctuation signs to fullwidth', function () {
        expect(converters.punctuationHF(sample)).toEqual('ABC ＡＢＣ　123１２３．，─．，─ゔあいうえおはばぱｶｷｸｹｺﾊﾊﾞﾊﾟヴカキクケコハバパ')
      })
    })

    describe('.katakana', function () {
      it('should transform halfwidth katakana to fullwidth', function () {
        expect(converters.katakanaHF(sample)).toEqual('ABC ＡＢＣ　123１２３.,-．，-ゔあいうえおはばぱカキクケコハバパヴカキクケコハバパ')
      })
    })
  })

  describe('.hiraganaToKatakana', function () {
    it('should transform hiragana to katakana', function () {
      expect(converters.hiraganaToKatakana(sample)).toEqual('ABC ＡＢＣ　123１２３.,-．，-ヴアイウエオハバパカキクケコハバパヴカキクケコハバパ')
    })
  })

  describe('.katakanaToHiragana', function () {
    it('should transform katakana to hiragana', function () {
      expect(converters.katakanaToHiragana(sample)).toEqual('ABC ＡＢＣ　123１２３.,-．，-ゔあいうえおはばぱかきくけこはばぱゔかきくけこはばぱ')
    })
  })
})
