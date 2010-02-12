(function(){function a(j,h,k){if(JSMocka.isArray(j)){for(var g=0,e=j.length;g<e;g++){k.call(h,j[g])}}else{for(var f in j){k.call(h,f).returns(j[f])}}return h}function c(e){return function(h,g){var f=new JSMocka(h||{},g);if(g&&typeof g!=="function"){f[e](g)}return f}}function b(e,f){if(JSMocka.Configuration.shouldPrevent("StubbingNonExistentMethod",e)){if(!(f in e)){throw new Error("JSMocka::Expectation.Stubbing non existent method: "+f)}}if(JSMocka.Configuration.shouldPrevent("StubbingNonPublicMethod",e)){if((/^_/).test(f)){throw new Error("JSMocka::Expectation.Stubbing non public method: "+f)}}}var d=[];JSMocka=function(e,g){this.stubs=function(h){if(JSMocka.isString(h)){return this.expects(h).anyTime().setEvaluable(false)}return a(h,this,this.stubs)};this.expects=function(i){if(JSMocka.isString(i)){b(e,i);var h=new JSMocka.Expectation(e,i);h.apply();d.push(h);return h}return a(i,this,this.expects)};this.anyInstance=function(){if(e.prototype){e=e.prototype}return this};this.allow=function(){JSMocka.Configuration.allow(JSMocka.toArray(arguments),e);return this};this.prevent=function(){JSMocka.Configuration.prevent(JSMocka.toArray(arguments),e);return this};if(typeof g==="function"){var f=g.toString().match(/^[^\{]*\{((.*\n*)*)\}/m)[1];new Function("api","with (this) { "+f+" }").call(this)}};JSMocka.setup=function(){d=[]};JSMocka.verify=function(h){var f;for(var g=0,e=d.length;g<e;g++){f=d[g];if(f.isEvaluable()){if(f.evaluate()){h.pass&&h.pass()}else{h.fail("Expectation "+f.toString()+" not satisfied. Details: "+f.details())}}f.restore()}};JSMocka.mock=c("expects");JSMocka.stub=c("stubs");JSMocka.extend=function(e){for(extension in e){JSMocka[extension]=e[extension]}}})();JSMocka.extend((function(){var b=function(){};b.create=function(e){var d=this;var f=function(){this._super=d;var g=e.apply(this,arguments),c=this;for(key in g){(function(h,i){c[key]=typeof h!="function"||typeof i!="function"?h:function(){this._super=i;return h.apply(this,arguments)}})(g[key],c[key])}};f.prototype=new this;f.prototype.constructor=f;f.extend=this.extend||this.create;return f};var a=(function(c){return function(d){return c.call(d).slice(8,-1)}})(Object.prototype.toString);return{Class:b,isString:function(c){return a(c)==="String"},isArray:function(c){return a(c)==="Array"},isObject:function(c){return c!==null&&a(c)==="Object"},toArray:(function(c){return function(d){return c.call(d||[])}})(Array.prototype.slice),hasKey:function(d,c){return JSMocka.isObject(c)&&d in c},inspect:function(c){if(c===null){return"null"}if((/string|number|boolean|undefined/i).test(typeof c)){return c+""}if(JSMocka.isArray(c)){return"["+JSMocka.collect(c,JSMocka.inspect).join(", ")+"]"}if(JSMocka.isObject(c)){return"{ "+JSMocka.collect(c,function(e,d){return d+": "+e}).join(", ")+" }"}return c.constructor||c.prototype.constructor},collect:function(d,h){var g=[];if(JSMocka.isArray(d)){for(var f=0,c=d.length;f<c;f++){g.push(h(d[f]))}}else{for(var e in d){g.push(h(d[e],e,d))}}return g}}})());(function(){var a={Prevent:0,Allow:1,Warn:2},d={StubbingNonExistentMethod:a.Allow,StubbingNonPublicMethod:a.Prevent},c=[],e={};function b(k,h){var l;for(var j=0,g=c.length;j<g;j++){l=c[j];if(l.object===h&&k in l.rules){return l.rules[k]}}return d[k]}function f(m,j,h){if(JSMocka.isArray(m)){var l={},g=m.length;for(var k=0;k<g;k++){l[m[k]]=h}c.push({object:j||e,rules:l})}}JSMocka.Configuration={allow:function(h,g){f(h,g,a.Allow)},prevent:function(h,g){f(h,g,a.Prevent)},warn:function(h,g){f(h,g,a.Warn)},shouldAllow:function(h,g){return b(h,g)===a.Allow},shouldPrevent:function(h,g){return b(h,g)===a.Prevent},shouldWarn:function(h,g){return b(h,g)===a.Warn}}})();JSMocka.Matcher={AnyParameters:function(){return new JSMocka.Matcher.AnyParametersMatcher()},AnyOf:function(){return new JSMocka.Matcher.AnyOfParameterMatcher(JSMocka.toArray(arguments))},AllOf:function(){return new JSMocka.Matcher.AllOfParameterMatcher(JSMocka.toArray(arguments))},Nothing:function(){return new JSMocka.Matcher.NoParametersMatcher()},Exactly:function(a){return new JSMocka.Matcher.ExactParameterMatcher(a)},AnyParameter:function(){return new JSMocka.Matcher.AnyParameterMatcher()},Anything:function(){return JSMocka.Matcher.AnyParameter()},Having:function(a){return new JSMocka.Matcher.HavingMatcher(a)},HavingKey:function(a){return new JSMocka.Matcher.HavingKeyMatcher(a)},HavingValue:function(a){return new JSMocka.Matcher.HavingValueMatcher(a)},InstanceOf:function(a){return new JSMocka.Matcher.InstanceOfMatcher(a)},Includes:function(a){return new JSMocka.Matcher.IncludesParameterMatcher(a)},SomethingLike:function(a){return new JSMocka.Matcher.RegexpParameterMatcher(a)},RespondsWith:function(b,a){return new JSMocka.Matcher.RespondsWithParameterMatcher(b,a)},Not:function(a){return new JSMocka.Matcher.NotParameterMatcher(a)}};JSMocka.Matcher.ParametersMatcher=JSMocka.Class.create(function(b){var a=JSMocka.toArray(b);return{match:function(f){var h=[].concat(f),e=true,d=this.matchers();for(var g=0,c=d.length;g<c;g++){if(!d[g].match(h)){e=false;break}}return e&&h.length===0},matchers:function(){var d=[];for(var e=0,c=a.length;e<c;e++){d.push(this.toMatcher(a[e]))}return d},toMatcher:function(c){if(JSMocka.hasKey("match",c)){return c}else{return new JSMocka.Matcher.ExactParameterMatcher(c)}},toString:function(){var e=this.matchers(),d=[];for(var f=0,c=e.length;f<c;f++){d.push(e[f].toString())}return d.join(", ")}}});JSMocka.Matcher.ParameterMatcher=JSMocka.Class.create(function(){return{match:function(a){throw ("Not Implemented")},toMatcher:function(a){if(JSMocka.hasKey("match",a)){return a}else{return new JSMocka.Matcher.ExactParameterMatcher(a)}}}});JSMocka.Matcher.AnyParametersMatcher=JSMocka.Matcher.ParametersMatcher.extend(function(){return{match:function(b){for(var c=0,a=b.length;c<a;c++){b.pop()}return true},toString:function(){return"any parameters"}}});JSMocka.Matcher.CompositeParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){return{matchers:function(){var c=[];for(var d=0,b=a.length;d<b;d++){c.push(this.toMatcher(a[d]))}return c}}});JSMocka.Matcher.AnyOfParameterMatcher=JSMocka.Matcher.CompositeParameterMatcher.extend(function(a){this._super(a);return{match:function(e){var d=e.shift(),c=this.matchers();for(var f=0,b=c.length;f<b;f++){if(c[f].match([d])){return true}}return false},toString:function(){var d=this.matchers(),c=[];for(var e=0,b=d.length;e<b;e++){c.push(d[e].toString())}return"any of ("+c.join(", ")+")"}}});JSMocka.Matcher.AllOfParameterMatcher=JSMocka.Matcher.CompositeParameterMatcher.extend(function(a){this._super(a);return{match:function(e){var d=e.shift(),c=this.matchers();for(var f=0,b=c.length;f<b;f++){if(!c[f].match([d])){return false}}return true},toString:function(){var d=this.matchers(),c=[];for(var e=0,b=d.length;e<b;e++){c.push(d[e].toString())}return"all of ("+c.join(", ")+")"}}});JSMocka.Matcher.NoParametersMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(){return{match:function(a){return a.length===0},toString:function(){return"no parameters"}}});JSMocka.Matcher.ExactParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){return{match:function(b){return b.shift()==a},toString:function(){return JSMocka.inspect(a)}}});JSMocka.Matcher.AnyParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(){return{match:function(a){return a.shift()!==undefined},toString:function(){return"any parameter"}}});JSMocka.Matcher.HavingMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){return{match:function(c){var b=c.shift();for(var d in a){if(b[d]==a[d]){return true}}return false},toString:function(){return"[hash containing "+JSMocka.inspect(a)+"]"}}});JSMocka.Matcher.HavingKeyMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){a=this.toMatcher(a);return{match:function(c){var b=c.shift();for(var d in b){if(a.match([d])){return true}}return false},toString:function(){return"[hash with key "+a.toString()+"]"}}});JSMocka.Matcher.HavingValueMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){a=this.toMatcher(a);return{match:function(c){var b=c.shift();for(var d in b){if(a.match([b[d]])){return true}}return false},toString:function(){return"[hash with value "+a.toString()+"]"}}});JSMocka.Matcher.InstanceOfMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){return{match:function(b){return b.shift() instanceof a},toString:function(){return"[instanceof "+inspect(a)+"]"}}});JSMocka.Matcher.IncludesParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){a=this.toMatcher(a);return{match:function(d){var c=d.shift();if(JSMocka.isArray(c)){for(var e=0,b=c.length;e<b;e++){if(a.match([c[e]])){return true}}}return false},toString:function(){return"[including "+a.toString()+"]"}}});JSMocka.Matcher.RegexpParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){return{match:function(b){return a.test(b.shift())},toString:function(){return"regexp "+JSMocka.inspect(a)}}});JSMocka.Matcher.RespondsWithParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(b,a){return{match:function(c){var d=c.shift();if(a===undefined){return d[b]}else{return d[b]&&d[b]()}},toString:function(){var c='responds with "'+b+'"';if(a!==undefined){c+=" returning "+JSMocka.inspect(a)}return c}}});JSMocka.Matcher.NotParameterMatcher=JSMocka.Matcher.ParameterMatcher.extend(function(a){a=this.toMatcher(a);return{match:function(b){return !a.match(b)},toString:function(){return"not "+a}}});JSMocka.Matcher.AnyCardinalityMatcher=JSMocka.Class.create(function(){return{match:function(a){return true},toString:function(){return"zero or more times"}}});JSMocka.Matcher.ExactCardinalityMatcher=JSMocka.Class.create(function(a){return{match:function(b){return b==a},toString:function(){return"exactly "+a+" times"}}});JSMocka.Matcher.RangeCardinalityMatcher=JSMocka.Class.create(function(b,a){return{match:function(c){return b<=c&&c<=a},toString:function(){return"between "+b+" and "+a+" times"}}});JSMocka.Matcher.MinimumCardinalityMatcher=JSMocka.Class.create(function(a){return{match:function(b){return b>=a},toString:function(){return"at least "+a+" times"}}});JSMocka.Matcher.MaximumCardinalityMatcher=JSMocka.Class.create(function(a){return{match:function(b){return b<=a},toString:function(){return"at most "+a+" times"}}});JSMocka.Expectation=function(k,c){var i=null,l=new JSMocka.Matcher.ParametersMatcher([new JSMocka.Matcher.AnyParametersMatcher()]),g=new JSMocka.Matcher.ExactCardinalityMatcher(1),j,f=true,h=0,d=[],b=[],a=false,e=true,m=false;function n(){var o=JSMocka.toArray(arguments);d=d.concat(o);f=f&&l.match(o);h++;return b.length>1?b.shift():b[0]}this.apply=function(){if(!m){i=k[c];k[c]=n;m=true}};this.restore=function(){if(m){k[c]=i;i=null}};this.evaluate=function(){j=g.match(h);var o=f&&j;return a?!o:o};this.toString=function(){var p=(a?"NOT ":"")+"Call of method '"+c;p+="' with "+l.toString();p+=", "+g.toString();var o=JSMocka.collect(b,function(q){return JSMocka.inspect(q)}).join(", then ");if(o.length>0){p+=", returning "+o}return p};this.details=function(){var o="Parameters were"+(f?"":" NOT")+" correctly matched. ";o+="Expected number of calls was"+(j?"":" NOT")+" matched. ";o+=h+" times called";if(d.length>0){o+=", with "+JSMocka.collect(d,function(p){return JSMocka.inspect(p)}).join("; ")}if(a){o+=" NOTE! This expectation was negated."}return o};this.withArgs=function(o){l=new JSMocka.Matcher.ParametersMatcher(arguments);return this};this.then=function(){return this};this.times=function(o){g=new JSMocka.Matcher.ExactCardinalityMatcher(o);return this};this.anyTime=function(){g=new JSMocka.Matcher.AnyCardinalityMatcher();return this};this.never=function(){return this.times(0)};this.once=function(){return this.times(1)};this.twice=function(){return this.times(2)};this.atLeast=function(o){g=new JSMocka.Matcher.MinimumCardinalityMatcher(o);return this};this.atMost=function(o){g=new JSMocka.Matcher.MaximumCardinalityMatcher(o);return this};this.between=function(p,o){g=new JSMocka.Matcher.RangeCardinalityMatcher(p,o);return this};this.not=function(){a=true;return this};this.returns=function(){b=b.concat(JSMocka.toArray(arguments));return this};this.isEvaluable=function(){return e};this.setEvaluable=function(o){e=o;return this}};(function(){function b(d,c){for(method in d){c[method]=d[method]}}function a(c){b(JSMocka,c);b(JSMocka.Matcher,c)}JSMocka.Integration={ScrewUnit:function(){a(Screw.Matchers);Screw.Unit(function(){before(function(){JSMocka.setup()});after(function(){JSMocka.verify({fail:function(c){throw c}})})})}}})();