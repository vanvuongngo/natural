/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

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

/* eslint-disable no-new */
import { SentenceAnalyzer } from 'lib/natural'
import { SenType } from 'lib/natural/analyzers/SenType'
import type {
  TaggedSentence,
  TaggedWord,
  PunctuationFunction,
  PunctuationMapping,
  CallbackFunction
} from 'lib/natural'

declare type Tests = Array<{
  token?: string
  result: string | boolean
  argument?: string
  index?: string
}>

describe('sentence analyzer', function () {
  function testSentenceAnalyzer (sentenceTags: TaggedWord[], tests: Tests, callback: CallbackFunction): void {
    new SentenceAnalyzer({ tags: sentenceTags, punct: function () { return [] } }, function (analyzer) {
      analyzer.part(function (part) {
        const posTags = part.posObj.tags
        for (let tagNum = 0; tagNum < posTags.length; tagNum++) {
          const posTag = posTags[tagNum]
          tests.forEach(t => {
            if (posTag.token === t.token && t.argument !== undefined) {
              expect(posTag[t.argument]).toEqual(t.result)
            }
          })
        }
        const lastTagNum = posTags.length - 1
        tests.forEach(t => {
          if (t.index !== undefined && t.argument !== undefined) {
            expect(posTags[lastTagNum][t.argument]).toEqual(t.result)
          }
        })
      })
      callback(analyzer)
    })
  }

  it('should determine PP and SP, given a POS', function () {
    const sentenceTags: TaggedWord[] = [
      { token: 'The', pos: 'DT' },
      { token: 'angry', pos: 'JJ' },
      { token: 'bear', pos: 'NN' },
      { token: 'chased', pos: 'VB' },
      { token: 'the', pos: 'DT' },
      { token: 'frightened', pos: 'JJ' },
      { token: 'little', pos: 'JJ' },
      { token: 'squirrel', pos: 'NN' }
    ]

    const tests: Tests = [
      {
        token: 'angry',
        argument: 'spos',
        result: 'SP'
      },
      {
        token: 'squirrel',
        argument: 'spos',
        result: 'PP'
      }
    ]

    testSentenceAnalyzer(sentenceTags, tests, function (analyzer) {
      expect(analyzer.subjectToString().trim()).toEqual('The angry bear')
      expect(analyzer.predicateToString().trim()).toEqual('chased the frightened little squirrel')
      expect(analyzer.toString().trim()).toEqual('The angry bear chased the frightened little squirrel')
      expect(analyzer.implicitYou()).toEqual(false)
    })
  })

  it('should determine PP and SP given a POS that begins with a verb', function () {
    const sentenceTags = [
      { token: 'Vote', pos: 'VB' },
      { token: 'for', pos: 'IN' },
      { token: 'me', pos: 'PRP' }
    ]

    const tests: Tests = [
      {
        token: 'Vote',
        argument: 'spos',
        result: 'PP'
      },
      {
        token: 'me',
        argument: 'pp',
        result: true
      },
      {
        index: 'LAST',
        argument: 'token',
        result: 'You'
      },
      {
        index: 'LAST',
        argument: 'pos',
        result: 'PRP'
      },
      {
        index: 'LAST',
        argument: 'added',
        result: true
      }
    ]

    testSentenceAnalyzer(sentenceTags, tests, function (analyzer) {
      expect(analyzer.implicitYou()).toEqual(true)
    })
  })

  it('should look for EX before VB', function () {
    const sentenceTags = [
      { token: 'There', pos: 'EX' },
      { token: 'is', pos: 'VB' },
      { token: 'a', pos: 'DT' },
      { token: 'house', pos: 'NN' },
      { token: 'in', pos: 'IN' },
      { token: 'the', pos: 'DT' },
      { token: 'valley', pos: 'DT' }
    ]

    const tests = [
      {
        token: 'There',
        argument: 'spos',
        result: 'SP'
      },
      {
        token: 'is',
        argument: 'spos',
        result: 'SP'
      }
    ]

    testSentenceAnalyzer(sentenceTags, tests, function (analyzer) {
      expect(analyzer.subjectToString().trim()).toEqual('There is a house')
      expect(analyzer.predicateToString().trim()).toEqual('')
      expect(analyzer.toString().trim()).toEqual('There is a house in the valley')
      expect(analyzer.implicitYou()).toEqual(false)
    })
  })

  function testSentenceType (args: TaggedSentence, sentenceType: SenType, callback: CallbackFunction | null): void {
    new SentenceAnalyzer(args, function (analyzer) {
      analyzer.part(function () {
        analyzer.type(function (type) {
          expect(analyzer.senType).toEqual(sentenceType)
        })
      })
      if (callback !== null) {
        callback(analyzer)
      }
    })
  }

  describe('#type', function () {
    it('should determine a command without punctuation', function () {
      const sentenceTags = [
        { token: 'Vote', pos: 'VB' },
        { token: 'for', pos: 'IN' },
        { token: 'me', pos: 'PRP' }
      ]
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return []
      }

      testSentenceType({ tags: sentenceTags, punct }, SenType.Command, null)
    })

    it('should determine an interrogative beginning with who', function () {
      const sentenceTags = [
        { token: 'Who', pos: 'WP' },
        { token: 'voted', pos: 'VB' }
      ]
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return []
      }

      testSentenceType({ tags: sentenceTags, punct }, SenType.Interrogative, null)
    })

    it('should determine an interrogative ending with a personal pronoun', function () {
      const sentenceTags = [
        { token: 'Should', pos: 'MD' },
        { token: 'we', pos: 'PRP' }
      ]
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return ''
      }

      testSentenceType({ tags: sentenceTags, punct }, SenType.Interrogative, null)
    })

    it('should classify other sentences as unknown', function () {
      const sentenceTags = [
        { token: 'I', pos: 'PRP' },
        { token: 'am', pos: 'VB' },
        { token: 'unsure', pos: 'JJ' }
      ]
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return ''
      }

      testSentenceType({ tags: sentenceTags, punct }, SenType.Unknown, null)
    })

    it('should determine an interrogative ending with a question mark', function () {
      const sentenceTags = [
        { token: 'Do', pos: 'VB' },
        { token: 'I', pos: 'PRP' },
        { token: 'care', pos: 'VB' }
      ]
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return [{ token: '?', pos: '.' }]
      }

      testSentenceType({ tags: sentenceTags, punct }, SenType.Interrogative, null)
    })

    const taggedSentForCommand = [
      { token: 'Vote', pos: 'VB' },
      { token: 'for', pos: 'IN' },
      { token: 'me', pos: 'PRP' }
    ]

    it('should determine a command ending in an exclamation point', function () {
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return [{ token: '!', pos: '.' }]
      }

      testSentenceType({ tags: taggedSentForCommand, punct }, SenType.Command, null)
    })

    it('should determine a command ending with .', function () {
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return [{ token: '.', pos: '.' }]
      }

      testSentenceType({ tags: taggedSentForCommand, punct }, SenType.Command, null)
    })

    const taggedSentenceForExclam = [
      { token: 'We', pos: 'PRP' },
      { token: 'like', pos: 'VB' },
      { token: 'sheep', pos: 'NN' }
    ]

    it('should determine an exclamation ending in an exclamation point', function () {
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return [{ token: '!', pos: '.' }]
      }

      testSentenceType({ tags: taggedSentenceForExclam, punct }, SenType.Exclamatory, null)
    })

    it('should determine a declaration ending with a .', function () {
      const punct: PunctuationFunction = function (): PunctuationMapping {
        return [{ token: '.', pos: '.' }]
      }

      testSentenceType({ tags: taggedSentenceForExclam, punct }, SenType.Declarative, null)
    })
  })
})
