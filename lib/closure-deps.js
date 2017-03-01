// Input 0
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 * Avoid including base.js more than once. This is strictly discouraged and not
 * supported. goog.require(...) won't work properly in that case.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when
 *     --process_closure_primitives is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
 * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
 * {@code goog.define} will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part] && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retrieved from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled the default can be overridden using the compiler
 * options or the value set in the CLOSURE_DEFINES object.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else if (
        goog.global.CLOSURE_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.define('goog.DEBUG', true);


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether a project is expected to be running in strict mode.
 *
 * This define can be used to trigger alternate implementations compatible with
 * running in EcmaScript Strict mode or warn about unavailable functionality.
 * @see https://goo.gl/PudQ4y
 *
 */
goog.define('goog.STRICT_MODE_COMPATIBLE', false);


/**
 * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
 *     be disallowed in the compilation unit.
 */
goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);


/**
 * @define {boolean} Whether to use a Chrome app CSP-compliant method for
 *     loading scripts via goog.require. @see appendScriptSrcNode_.
 */
goog.define('goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING', false);


/**
 * Defines a namespace in Closure.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * The presence of one or more goog.provide() calls in a file indicates
 * that the file defines the given objects/namespaces.
 * Provided symbols must not be null or undefined.
 *
 * In addition, goog.provide() creates the object stubs for a namespace
 * (for example, goog.provide("goog.foo.bar") will create the object
 * goog.foo.bar if it does not already exist).
 *
 * Build tools also scan for provide/require/module statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 *
 * @see goog.require
 * @see goog.module
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (goog.isInModuleLoader_()) {
    throw Error('goog.provide can not be used within a goog.module.');
  }
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
  }

  goog.constructNamespace_(name);
};


/**
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * @param {Object=} opt_obj The object to embed in the namespace.
 * @private
 */
goog.constructNamespace_ = function(name, opt_obj) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name, opt_obj);
};


/**
 * Module identifier validation regexp.
 * Note: This is a conservative check, it is very possible to be more lenient,
 *   the primary exclusion here is "/" and "\" and a leading ".", these
 *   restrictions are intended to leave the door open for using goog.require
 *   with relative file paths rather than module identifiers.
 * @private
 */
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;


/**
 * Defines a module in Closure.
 *
 * Marks that this file must be loaded as a module and claims the namespace.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * goog.module() has three requirements:
 * - goog.module may not be used in the same file as goog.provide.
 * - goog.module must be the first statement in the file.
 * - only one goog.module is allowed per file.
 *
 * When a goog.module annotated file is loaded, it is enclosed in
 * a strict function closure. This means that:
 * - any variables declared in a goog.module file are private to the file
 * (not global), though the compiler is expected to inline the module.
 * - The code must obey all the rules of "strict" JavaScript.
 * - the file will be marked as "use strict"
 *
 * NOTE: unlike goog.provide, goog.module does not declare any symbols by
 * itself. If declared symbols are desired, use
 * goog.module.declareLegacyNamespace().
 *
 *
 * See the public goog.module proposal: http://goo.gl/Va1hin
 *
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part", is expected but not required.
 * @return {void}
 */
goog.module = function(name) {
  if (!goog.isString(name) || !name ||
      name.search(goog.VALID_MODULE_RE_) == -1) {
    throw Error('Invalid module identifier');
  }
  if (!goog.isInModuleLoader_()) {
    throw Error(
        'Module ' + name + ' has been loaded incorrectly. Note, ' +
        'modules cannot be loaded as normal scripts. They require some kind of ' +
        'pre-processing step. You\'re likely trying to load a module via a ' +
        'script tag or as a part of a concatenated bundle without rewriting the ' +
        'module. For more info see: ' +
        'https://github.com/google/closure-library/wiki/goog.module:-an-ES6-module-like-alternative-to-goog.provide.');
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module may only be called once per module.');
  }

  // Store the module name for the loader.
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 *
 * Note: This is not an alternative to goog.require, it does not
 * indicate a hard dependency, instead it is used to indicate
 * an optional dependency or to access the exports of a module
 * that has already been loaded.
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 * @private
 */
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (name in goog.loadedModules_) {
      return goog.loadedModules_[name];
    } else if (!goog.implicitNamespaces_[name]) {
      var ns = goog.getObjectByName(name);
      return ns != null ? ns : null;
    }
  }
  return null;
};


/**
 * @private {?{moduleName: (string|undefined), declareLegacyNamespace:boolean}}
 */
goog.moduleLoaderState_ = null;


/**
 * @private
 * @return {boolean} Whether a goog.module is currently being initialized.
 */
goog.isInModuleLoader_ = function() {
  return goog.moduleLoaderState_ != null;
};


/**
 * Provide the module's exports as a globally accessible object under the
 * module's declared name.  This is intended to ease migration to goog.module
 * for files that have existing usages.
 * @suppress {missingProvide}
 */
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw new Error(
        'goog.module.declareLegacyNamespace must be called from ' +
        'within a goog.module');
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error(
        'goog.module must be called prior to ' +
        'goog.module.declareLegacyNamespace.');
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw Error(
        'Importing test-only code into non-debug environment' +
        (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 * Before using goog.forwardDeclare, please read the documentation at
 * https://github.com/google/closure-compiler/wiki/Bad-Type-Annotation to
 * understand the options and tradeoffs when working with forward declarations.
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 */
goog.forwardDeclare = function(name) {};


/**
 * Forward declare type information. Used to assign types to goog.global
 * referenced object that would otherwise result in unknown type references
 * and thus block property disambiguation.
 */
goog.forwardDeclare('Document');
goog.forwardDeclare('HTMLScriptElement');
goog.forwardDeclare('XMLHttpRequest');


if (!COMPILED) {
  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return (name in goog.loadedModules_) ||
        (!goog.implicitNamespaces_[name] &&
         goog.isDefAndNotNull(goog.getObjectByName(name)));
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {!Object<string, (boolean|undefined)>}
   * @private
   */
  goog.implicitNamespaces_ = {'goog.module': true};

  // NOTE: We add goog.module as an implicit namespace as goog.module is defined
  // here and because the existing module package has not been moved yet out of
  // the goog.module namespace. This satisifies both the debug loader and
  // ahead-of-time dependency management.
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {!Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {!Array<string>} provides An array of strings with
 *     the names of the objects this file provides.
 * @param {!Array<string>} requires An array of strings with
 *     the names of the objects this file requires.
 * @param {boolean|!Object<string>=} opt_loadFlags Parameters indicating
 *     how the file must be loaded.  The boolean 'true' is equivalent
 *     to {'module': 'goog'} for backwards-compatibility.  Valid properties
 *     and values include {'module': 'goog'} and {'lang': 'es6'}.
 */
goog.addDependency = function(relPath, provides, requires, opt_loadFlags) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    if (!opt_loadFlags || typeof opt_loadFlags === 'boolean') {
      opt_loadFlags = opt_loadFlags ? {'module': 'goog'} : {};
    }
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      deps.loadFlags[path] = opt_loadFlags;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
//
// User-defined namespaces may need their own deps file. For a reference on
// creating a deps file, see:
// Externally: https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * @param {string} msg
 * @private
 */
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console['error'](msg);
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --process_closure_primitives option is
 * used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 * @return {?} If called within a goog.module file, the associated namespace or
 *     module otherwise null.
 */
goog.require = function(name) {
  // If the object already exists we do not need do do anything.
  if (!COMPILED) {
    if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
      goog.maybeProcessDeferredDep_(name);
    }

    if (goog.isProvided_(name)) {
      if (goog.isInModuleLoader_()) {
        return goog.module.getInternal_(name);
      }
    } else if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.writeScripts_(path);
      } else {
        var errorMessage = 'goog.require could not find: ' + name;
        goog.logToConsole_(errorMessage);

        throw Error(errorMessage);
      }
    }

    return null;
  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 * @type {(function(string): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  // instance_ is immediately set to prevent issues with sealed constructors
  // such as are encountered when a constructor is returned as the export object
  // of a goog.module in unoptimized code.
  ctor.instance_ = undefined;
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * @define {boolean} Whether to load goog.modules using {@code eval} when using
 * the debug loader.  This provides a better debugging experience as the
 * source is unmodified and can be edited using Chrome Workspaces or similar.
 * However in some environments the use of {@code eval} is banned
 * so we provide an alternative.
 */
goog.define('goog.LOAD_MODULE_USING_EVAL', true);


/**
 * @define {boolean} Whether the exports of goog.modules should be sealed when
 * possible.
 */
goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);


/**
 * The registry of initialized modules:
 * the module identifier to module exports map.
 * @private @const {!Object<string, ?>}
 */
goog.loadedModules_ = {};


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


/**
 * @define {string} How to decide whether to transpile.  Valid values
 * are 'always', 'never', and 'detect'.  The default ('detect') is to
 * use feature detection to determine which language levels need
 * transpilation.
 */
// NOTE(user): we could expand this to accept a language level to bypass
// detection: e.g. goog.TRANSPILE == 'es5' would transpile ES6 files but
// would leave ES3 and ES5 files alone.
goog.define('goog.TRANSPILE', 'detect');


/**
 * @define {string} Path to the transpiler.  Executing the script at this
 * path (relative to base.js) should define a function $jscomp.transpile.
 */
goog.define('goog.TRANSPILER', 'transpile.js');


if (goog.DEPENDENCIES_ENABLED) {
  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {{
   *   loadFlags: !Object<string, !Object<string, string>>,
   *   nameToPath: !Object<string, string>,
   *   requires: !Object<string, !Object<string, boolean>>,
   *   visited: !Object<string, boolean>,
   *   written: !Object<string, boolean>,
   *   deferred: !Object<string, string>
   * }}
   */
  goog.dependencies_ = {
    loadFlags: {},  // 1 to 1

    nameToPath: {},  // 1 to 1

    requires: {},  // 1 to many

    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},

    written: {},  // Used to keep track of script files we have written.

    deferred: {}  // Used to track deferred module evaluations in old IEs
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    /** @type {Document} */
    var doc = goog.global.document;
    return doc != null && 'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    /** @type {Document} */
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('SCRIPT');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @private
   */
  goog.importScript_ = function(src, opt_sourceText) {
    var importScript =
        goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if (importScript(src, opt_sourceText)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * Whether the browser is IE9 or earlier, which needs special handling
   * for deferred modules.
   * @const @private {boolean}
   */
  goog.IS_OLD_IE_ =
      !!(!goog.global.atob && goog.global.document && goog.global.document.all);


  /**
   * Given a URL initiate retrieval and execution of a script that needs
   * pre-processing.
   * @param {string} src Script source URL.
   * @param {boolean} isModule Whether this is a goog.module.
   * @param {boolean} needsTranspile Whether this source needs transpilation.
   * @private
   */
  goog.importProcessedScript_ = function(src, isModule, needsTranspile) {
    // In an attempt to keep browsers from timing out loading scripts using
    // synchronous XHRs, put each load in its own script block.
    var bootstrap = 'goog.retrieveAndExec_("' + src + '", ' + isModule + ', ' +
        needsTranspile + ');';

    goog.importScript_('', bootstrap);
  };


  /** @private {!Array<string>} */
  goog.queuedModules_ = [];


  /**
   * Return an appropriate module text. Suitable to insert into
   * a script tag (that is unescaped).
   * @param {string} srcUrl
   * @param {string} scriptText
   * @return {string}
   * @private
   */
  goog.wrapModule_ = function(srcUrl, scriptText) {
    if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
      return '' +
          'goog.loadModule(function(exports) {' +
          '"use strict";' + scriptText +
          '\n' +  // terminate any trailing single line comment.
          ';return exports' +
          '});' +
          '\n//# sourceURL=' + srcUrl + '\n';
    } else {
      return '' +
          'goog.loadModule(' +
          goog.global.JSON.stringify(
              scriptText + '\n//# sourceURL=' + srcUrl + '\n') +
          ');';
    }
  };

  // On IE9 and earlier, it is necessary to handle
  // deferred module loads. In later browsers, the
  // code to be evaluated is simply inserted as a script
  // block in the correct order. To eval deferred
  // code at the right time, we piggy back on goog.require to call
  // goog.maybeProcessDeferredDep_.
  //
  // The goog.requires are used both to bootstrap
  // the loading process (when no deps are available) and
  // declare that they should be available.
  //
  // Here we eval the sources, if all the deps are available
  // either already eval'd or goog.require'd.  This will
  // be the case when all the dependencies have already
  // been loaded, and the dependent module is loaded.
  //
  // But this alone isn't sufficient because it is also
  // necessary to handle the case where there is no root
  // that is not deferred.  For that there we register for an event
  // and trigger goog.loadQueuedModules_ handle any remaining deferred
  // evaluations.

  /**
   * Handle any remaining deferred goog.module evals.
   * @private
   */
  goog.loadQueuedModules_ = function() {
    var count = goog.queuedModules_.length;
    if (count > 0) {
      var queue = goog.queuedModules_;
      goog.queuedModules_ = [];
      for (var i = 0; i < count; i++) {
        var path = queue[i];
        goog.maybeProcessDeferredPath_(path);
      }
    }
  };


  /**
   * Eval the named module if its dependencies are
   * available.
   * @param {string} name The module to load.
   * @private
   */
  goog.maybeProcessDeferredDep_ = function(name) {
    if (goog.isDeferredModule_(name) && goog.allDepsAreAvailable_(name)) {
      var path = goog.getPathFromDeps_(name);
      goog.maybeProcessDeferredPath_(goog.basePath + path);
    }
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose evaluation has been deferred.
   * @private
   */
  goog.isDeferredModule_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    var loadFlags = path && goog.dependencies_.loadFlags[path] || {};
    var languageLevel = loadFlags['lang'] || 'es3';
    if (path && (loadFlags['module'] == 'goog' ||
                 goog.needsTranspile_(languageLevel))) {
      var abspath = goog.basePath + path;
      return (abspath) in goog.dependencies_.deferred;
    }
    return false;
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose declared dependencies have all been loaded
   *     (eval'd or a deferred module load)
   * @private
   */
  goog.allDepsAreAvailable_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && (path in goog.dependencies_.requires)) {
      for (var requireName in goog.dependencies_.requires[path]) {
        if (!goog.isProvided_(requireName) &&
            !goog.isDeferredModule_(requireName)) {
          return false;
        }
      }
    }
    return true;
  };


  /**
   * @param {string} abspath
   * @private
   */
  goog.maybeProcessDeferredPath_ = function(abspath) {
    if (abspath in goog.dependencies_.deferred) {
      var src = goog.dependencies_.deferred[abspath];
      delete goog.dependencies_.deferred[abspath];
      goog.globalEval(src);
    }
  };


  /**
   * Load a goog.module from the provided URL.  This is not a general purpose
   * code loader and does not support late loading code, that is it should only
   * be used during page load. This method exists to support unit tests and
   * "debug" loaders that would otherwise have inserted script tags. Under the
   * hood this needs to use a synchronous XHR and is not recommeneded for
   * production code.
   *
   * The module's goog.requires must have already been satisified; an exception
   * will be thrown if this is not the case. This assumption is that no
   * "deps.js" file exists, so there is no way to discover and locate the
   * module-to-be-loaded's dependencies and no attempt is made to do so.
   *
   * There should only be one attempt to load a module.  If
   * "goog.loadModuleFromUrl" is called for an already loaded module, an
   * exception will be throw.
   *
   * @param {string} url The URL from which to attempt to load the goog.module.
   */
  goog.loadModuleFromUrl = function(url) {
    // Because this executes synchronously, we don't need to do any additional
    // bookkeeping. When "goog.loadModule" the namespace will be marked as
    // having been provided which is sufficient.
    goog.retrieveAndExec_(url, true, false);
  };


  /**
   * Writes a new script pointing to {@code src} directly into the DOM.
   *
   * NOTE: This method is not CSP-compliant. @see goog.appendScriptSrcNode_ for
   * the fallback mechanism.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.writeScriptSrcNode_ = function(src) {
    goog.global.document.write(
        '<script type="text/javascript" src="' + src + '"></' +
        'script>');
  };


  /**
   * Appends a new script node to the DOM using a CSP-compliant mechanism. This
   * method exists as a fallback for document.write (which is not allowed in a
   * strict CSP context, e.g., Chrome apps).
   *
   * NOTE: This method is not analogous to using document.write to insert a
   * <script> tag; specifically, the user agent will execute a script added by
   * document.write immediately after the current script block finishes
   * executing, whereas the DOM-appended script node will not be executed until
   * the entire document is parsed and executed. That is to say, this script is
   * added to the end of the script execution queue.
   *
   * The page must not attempt to call goog.required entities until after the
   * document has loaded, e.g., in or after the window.onload callback.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.appendScriptSrcNode_ = function(src) {
    /** @type {Document} */
    var doc = goog.global.document;
    var scriptEl =
        /** @type {HTMLScriptElement} */ (doc.createElement('script'));
    scriptEl.type = 'text/javascript';
    scriptEl.src = src;
    scriptEl.defer = false;
    scriptEl.async = false;
    doc.head.appendChild(scriptEl);
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script url.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      /** @type {!HTMLDocument} */
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page. This does not apply to the CSP-compliant method
      // of writing script tags.
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
          doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      if (opt_sourceText === undefined) {
        if (!goog.IS_OLD_IE_) {
          if (goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
            goog.appendScriptSrcNode_(src);
          } else {
            goog.writeScriptSrcNode_(src);
          }
        } else {
          var state = ' onreadystatechange=\'goog.onScriptLoad_(this, ' +
              ++goog.lastNonModuleScriptIndex_ + ')\' ';
          doc.write(
              '<script type="text/javascript" src="' + src + '"' + state +
              '></' +
              'script>');
        }
      } else {
        doc.write(
            '<script type="text/javascript">' +
            goog.protectScriptTag_(opt_sourceText) + '</' +
            'script>');
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Rewrites closing script tags in input to avoid ending an enclosing script
   * tag.
   *
   * @param {string} str
   * @return {string}
   * @private
   */
  goog.protectScriptTag_ = function(str) {
    return str.replace(/<\/(SCRIPT)/ig, '\\x3c\\$1');
  };

  /**
   * Determines whether the given language needs to be transpiled.
   * @param {string} lang
   * @return {boolean}
   * @private
   */
  goog.needsTranspile_ = function(lang) {
    if (goog.TRANSPILE == 'always') {
      return true;
    } else if (goog.TRANSPILE == 'never') {
      return false;
    } else if (!goog.requiresTranspilation_) {
      goog.requiresTranspilation_ = goog.createRequiresTranspilation_();
    }
    if (lang in goog.requiresTranspilation_) {
      return goog.requiresTranspilation_[lang];
    } else {
      throw new Error('Unknown language mode: ' + lang);
    }
  };

  /** @private {?Object<string, boolean>} */
  goog.requiresTranspilation_ = null;


  /** @private {number} */
  goog.lastNonModuleScriptIndex_ = 0;


  /**
   * A readystatechange handler for legacy IE
   * @param {!HTMLScriptElement} script
   * @param {number} scriptIndex
   * @return {boolean}
   * @private
   */
  goog.onScriptLoad_ = function(script, scriptIndex) {
    // for now load the modules when we reach the last script,
    // later allow more inter-mingling.
    if (script.readyState == 'complete' &&
        goog.lastNonModuleScriptIndex_ == scriptIndex) {
      goog.loadQueuedModules_();
    }
    return true;
  };

  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @param {string} pathToLoad The path from which to start discovering
   *     dependencies.
   * @private
   */
  goog.writeScripts_ = function(pathToLoad) {
    /** @type {!Array<string>} The scripts we need to write this time. */
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    /** @param {string} path */
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    visitNode(pathToLoad);

    // record that we are going to load all these scripts.
    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      goog.dependencies_.written[path] = true;
    }

    // If a module is loaded synchronously then we need to
    // clear the current inModuleLoader value, and restore it when we are
    // done loading the current "requires".
    var moduleState = goog.moduleLoaderState_;
    goog.moduleLoaderState_ = null;

    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      if (path) {
        var loadFlags = deps.loadFlags[path] || {};
        var languageLevel = loadFlags['lang'] || 'es3';
        var needsTranspile = goog.needsTranspile_(languageLevel);
        if (loadFlags['module'] == 'goog' || needsTranspile) {
          goog.importProcessedScript_(
              goog.basePath + path, loadFlags['module'] == 'goog',
              needsTranspile);
        } else {
          goog.importScript_(goog.basePath + path);
        }
      } else {
        goog.moduleLoaderState_ = moduleState;
        throw Error('Undefined script input');
      }
    }

    // restore the current "module loading state"
    goog.moduleLoaderState_ = moduleState;
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}


/**
 * @package {?boolean}
 * Visible for testing.
 */
goog.hasBadLetScoping = null;


/**
 * @return {boolean}
 * @package Visible for testing.
 */
goog.useSafari10Workaround = function() {
  if (goog.hasBadLetScoping == null) {
    var hasBadLetScoping;
    try {
      hasBadLetScoping = !eval(
          '"use strict";' +
          'let x = 1; function f() { return typeof x; };' +
          'f() == "number";');
    } catch (e) {
      // Assume that ES6 syntax isn't supported.
      hasBadLetScoping = false;
    }
    goog.hasBadLetScoping = hasBadLetScoping;
  }
  return goog.hasBadLetScoping;
};


/**
 * @param {string} moduleDef
 * @return {string}
 * @package Visible for testing.
 */
goog.workaroundSafari10EvalBug = function(moduleDef) {
  return '(function(){' + moduleDef +
      '\n' +  // Terminate any trailing single line comment.
      ';' +   // Terminate any trailing expression.
      '})();\n';
};


/**
 * @param {function(?):?|string} moduleDef The module definition.
 */
goog.loadModule = function(moduleDef) {
  // NOTE: we allow function definitions to be either in the from
  // of a string to eval (which keeps the original source intact) or
  // in a eval forbidden environment (CSP) we allow a function definition
  // which in its body must call {@code goog.module}, and return the exports
  // of the module.
  var previousState = goog.moduleLoaderState_;
  try {
    goog.moduleLoaderState_ = {
      moduleName: undefined,
      declareLegacyNamespace: false
    };
    var exports;
    if (goog.isFunction(moduleDef)) {
      exports = moduleDef.call(undefined, {});
    } else if (goog.isString(moduleDef)) {
      if (goog.useSafari10Workaround()) {
        moduleDef = goog.workaroundSafari10EvalBug(moduleDef);
      }

      exports = goog.loadModuleFromSource_.call(undefined, moduleDef);
    } else {
      throw Error('Invalid module definition');
    }

    var moduleName = goog.moduleLoaderState_.moduleName;
    if (!goog.isString(moduleName) || !moduleName) {
      throw Error('Invalid module name \"' + moduleName + '\"');
    }

    // Don't seal legacy namespaces as they may be uses as a parent of
    // another namespace
    if (goog.moduleLoaderState_.declareLegacyNamespace) {
      goog.constructNamespace_(moduleName, exports);
    } else if (
        goog.SEAL_MODULE_EXPORTS && Object.seal && typeof exports == 'object' &&
        exports != null) {
      Object.seal(exports);
    }

    goog.loadedModules_[moduleName] = exports;
  } finally {
    goog.moduleLoaderState_ = previousState;
  }
};


/**
 * @private @const {function(string):?}
 *
 * The new type inference warns because this function has no formal
 * parameters, but its jsdoc says that it takes one argument.
 * (The argument is used via arguments[0], but NTI does not detect this.)
 * @suppress {newCheckTypes}
 */
goog.loadModuleFromSource_ = function() {
  // NOTE: we avoid declaring parameters or local variables here to avoid
  // masking globals or leaking values into the module definition.
  'use strict';
  var exports = {};
  eval(arguments[0]);
  return exports;
};


/**
 * Normalize a file path by removing redundant ".." and extraneous "." file
 * path components.
 * @param {string} path
 * @return {string}
 * @private
 */
goog.normalizePath_ = function(path) {
  var components = path.split('/');
  var i = 0;
  while (i < components.length) {
    if (components[i] == '.') {
      components.splice(i, 1);
    } else if (
        i && components[i] == '..' && components[i - 1] &&
        components[i - 1] != '..') {
      components.splice(--i, 2);
    } else {
      i++;
    }
  }
  return components.join('/');
};


/**
 * Loads file by synchronous XHR. Should not be used in production environments.
 * @param {string} src Source URL.
 * @return {?string} File contents, or null if load failed.
 * @private
 */
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    try {
      /** @type {XMLHttpRequest} */
      var xhr = new goog.global['XMLHttpRequest']();
      xhr.open('get', src, false);
      xhr.send();
      // NOTE: Successful http: requests have a status of 200, but successful
      // file: requests may have a status of zero.  Any other status, or a
      // thrown exception (particularly in case of file: requests) indicates
      // some sort of error, which we treat as a missing or unavailable file.
      return xhr.status == 0 || xhr.status == 200 ? xhr.responseText : null;
    } catch (err) {
      // No need to rethrow or log, since errors should show up on their own.
      return null;
    }
  }
};


/**
 * Retrieve and execute a script that needs some sort of wrapping.
 * @param {string} src Script source URL.
 * @param {boolean} isModule Whether to load as a module.
 * @param {boolean} needsTranspile Whether to transpile down to ES3.
 * @private
 */
goog.retrieveAndExec_ = function(src, isModule, needsTranspile) {
  if (!COMPILED) {
    // The full but non-canonicalized URL for later use.
    var originalPath = src;
    // Canonicalize the path, removing any /./ or /../ since Chrome's debugging
    // console doesn't auto-canonicalize XHR loads as it does <script> srcs.
    src = goog.normalizePath_(src);

    var importScript =
        goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;

    var scriptText = goog.loadFileSync_(src);
    if (scriptText == null) {
      throw new Error('Load of "' + src + '" failed');
    }

    if (needsTranspile) {
      scriptText = goog.transpile_.call(goog.global, scriptText, src);
    }

    if (isModule) {
      scriptText = goog.wrapModule_(src, scriptText);
    } else {
      scriptText += '\n//# sourceURL=' + src;
    }
    var isOldIE = goog.IS_OLD_IE_;
    if (isOldIE) {
      goog.dependencies_.deferred[originalPath] = scriptText;
      goog.queuedModules_.push(originalPath);
    } else {
      importScript(src, scriptText);
    }
  }
};


/**
 * Lazily retrieves the transpiler and applies it to the source.
 * @param {string} code JS code.
 * @param {string} path Path to the code.
 * @return {string} The transpiled code.
 * @private
 */
goog.transpile_ = function(code, path) {
  var jscomp = goog.global['$jscomp'];
  if (!jscomp) {
    goog.global['$jscomp'] = jscomp = {};
  }
  var transpile = jscomp.transpile;
  if (!transpile) {
    var transpilerPath = goog.basePath + goog.TRANSPILER;
    var transpilerCode = goog.loadFileSync_(transpilerPath);
    if (transpilerCode) {
      // This must be executed synchronously, since by the time we know we
      // need it, we're about to load and write the ES6 code synchronously,
      // so a normal script-tag load will be too slow.
      eval(transpilerCode + '\n//# sourceURL=' + transpilerPath);
      // Even though the transpiler is optional, if $gwtExport is found, it's
      // a sign the transpiler was loaded and the $jscomp.transpile *should*
      // be there.
      if (goog.global['$gwtExport'] && goog.global['$gwtExport']['$jscomp'] &&
          !goog.global['$gwtExport']['$jscomp']['transpile']) {
        throw new Error(
            'The transpiler did not properly export the "transpile" ' +
            'method. $gwtExport: ' + JSON.stringify(goog.global['$gwtExport']));
      }
      // transpile.js only exports a single $jscomp function, transpile. We
      // grab just that and add it to the existing definition of $jscomp which
      // contains the polyfills.
      goog.global['$jscomp'].transpile =
          goog.global['$gwtExport']['$jscomp']['transpile'];
      jscomp = goog.global['$jscomp'];
      transpile = jscomp.transpile;
    }
  }
  if (!transpile) {
    // The transpiler is an optional component.  If it's not available then
    // replace it with a pass-through function that simply logs.
    var suffix = ' requires transpilation but no transpiler was found.';
    transpile = jscomp.transpile = function(code, path) {
      // TODO(user): figure out some way to get this error to show up
      // in test results, noting that the failure may occur in many
      // different ways, including in loadModule() before the test
      // runner even comes up.
      goog.logToConsole_(path + suffix);
      return code;
    };
  }
  // Note: any transpilation errors/warnings will be logged to the console.
  return transpile(code, path);
};


//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {?} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals typeof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {!Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
               typeof value.splice != 'undefined' &&
               typeof value.propertyIsEnumerable != 'undefined' &&
               !value.propertyIsEnumerable('splice')

               )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
           typeof value.call != 'undefined' &&
               typeof value.propertyIsEnumerable != 'undefined' &&
               !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property. As a special case, a function value is not array like, because its
 * length property is fixed to correspond to the number of expected arguments.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  // We do not use goog.isObject here in order to exclude function values.
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if (obj !== null && 'removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = goog.bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like goog.bind(), except that a 'this object' is not required. Useful when
 * the target function is already bound.
 *
 * Usage:
 * var g = goog.partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
             // Unary plus operator converts its operand to a number which in
             // the case of
             // a date is done by calling getTime().
             return +new Date();
           });


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _evalTest_ = 1;');
      if (typeof goog.global['_evalTest_'] != 'undefined') {
        try {
          delete goog.global['_evalTest_'];
        } catch (ignore) {
          // Microsoft edge fails the deletion above in strict mode.
        }
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      /** @type {Document} */
      var doc = goog.global.document;
      var scriptElt =
          /** @type {!HTMLScriptElement} */ (doc.createElement('SCRIPT'));
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @private {!Object<string, string>|undefined}
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x = 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  // String() is used for compatibility with compiled soy where the passed
  // className can be non-string objects.
  if (String(className).charAt(0) == '.') {
    throw new Error(
        'className passed in goog.getCssName must not start with ".".' +
        ' You passed: ' + className);
  }

  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename =
        goog.cssNameMappingStyle_ == 'BY_WHOLE' ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  var result =
      opt_modifier ? className + '-' + rename(opt_modifier) : rename(className);

  // The special CLOSURE_CSS_NAME_MAP_FN allows users to specify further
  // processing of the class name.
  if (goog.global.CLOSURE_CSS_NAME_MAP_FN) {
    return goog.global.CLOSURE_CSS_NAME_MAP_FN(result);
  }

  return result;
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --process_closure_primitives flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {!Object<string, string>|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * This function produces a string which should be treated as plain text. Use
 * {@link goog.html.SafeHtmlFormatter} in conjunction with goog.getMsg to
 * produce SafeHtml.
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object<string, string>=} opt_values Maps place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ? opt_values[key] :
                                                         match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * constructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error(
        'arguments.caller not defined.  goog.base() cannot be used ' +
        'with strict mode code. See ' +
        'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
  }

  if (caller.superClass_) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }

  // Copying using loop to avoid deop due to passing arguments object to
  // function. This is faster in many JS engines as of late 2014.
  var args = new Array(arguments.length - 2);
  for (var i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  var foundCaller = false;
  for (var ctor = me.constructor; ctor;
       ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 *
 *
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  if (goog.isInModuleLoader_()) {
    throw Error('goog.scope is not supported within a goog.module.');
  }
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}


//==============================================================================
// goog.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {goog.defineClass.ClassDescriptor} def
 *     An object literal describing
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 */
goog.defineClass = function(superClass, def) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var constructor = def.constructor;
  var statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw Error('cannot instantiate an interface (no constructor defined).');
    };
  }

  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }

  // Remove all the properties that should not be copied to the prototype.
  delete def.constructor;
  delete def.statics;

  goog.defineClass.applyProperties_(cls.prototype, def);
  if (statics != null) {
    if (statics instanceof Function) {
      statics(cls);
    } else {
      goog.defineClass.applyProperties_(cls, statics);
    }
  }

  return cls;
};


/**
 * @typedef {{
 *   constructor: (!Function|undefined),
 *   statics: (Object|undefined|function(Function):void)
 * }}
 */
goog.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by goog.defineClass should
 *     be sealed when possible.
 *
 * When sealing is disabled the constructor function will not be wrapped by
 * goog.defineClass, making it incompatible with ES6 class methods.
 */
goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);


/**
 * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (!goog.defineClass.SEAL_CLASS_INSTANCES) {
    // Do now wrap the constructor when sealing is disabled. Angular code
    // depends on this for injection to work properly.
    return ctr;
  }

  // Compute whether the constructor is sealable at definition time, rather
  // than when the instance is being constructed.
  var superclassSealable = !goog.defineClass.isUnsealable_(superClass);

  /**
   * @this {Object}
   * @return {?}
   */
  var wrappedCtr = function() {
    // Don't seal an instance of a subclass when it calls the constructor of
    // its super class as there is most likely still setup to do.
    var instance = ctr.apply(this, arguments) || this;
    instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];

    if (this.constructor === wrappedCtr && superclassSealable &&
        Object.seal instanceof Function) {
      Object.seal(instance);
    }
    return instance;
  };

  return wrappedCtr;
};


/**
 * @param {Function} ctr The constructor to test.
 * @return {boolean} Whether the constructor has been tagged as unsealable
 *     using goog.tagUnsealableClass.
 * @private
 */
goog.defineClass.isUnsealable_ = function(ctr) {
  return ctr && ctr.prototype &&
      ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_];
};


// TODO(johnlenz): share these values with the goog.object
/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 * @private
 * @const
 */
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', 'toString', 'valueOf'
];


// TODO(johnlenz): share this function with the goog.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properties from.
 * @private
 */
goog.defineClass.applyProperties_ = function(target, source) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};


/**
 * Sealing classes breaks the older idiom of assigning properties on the
 * prototype rather than in the constructor. As such, goog.defineClass
 * must not seal subclasses of these old-style classes until they are fixed.
 * Until then, this marks a class as "broken", instructing defineClass
 * not to seal subclasses.
 * @param {!Function} ctr The legacy constructor to tag as unsealable.
 */
goog.tagUnsealableClass = function(ctr) {
  if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
    ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
  }
};


/**
 * Name for unsealable tag property.
 * @const @private {string}
 */
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'goog_defineClass_legacy_unsealable';


/**
 * Returns a newly created map from language mode string to a boolean
 * indicating whether transpilation should be done for that mode.
 *
 * Guaranteed invariant:
 * For any two modes, l1 and l2 where l2 is a newer mode than l1,
 * `map[l1] == true` implies that `map[l2] == true`.
 * @private
 * @return {!Object<string, boolean>}
 */
goog.createRequiresTranspilation_ = function() {
  var /** !Object<string, boolean> */ requiresTranspilation = {'es3': false};
  var transpilationRequiredForAllLaterModes = false;

  /**
   * Adds an entry to requiresTranspliation for the given language mode.
   *
   * IMPORTANT: Calls must be made in order from oldest to newest language
   * mode.
   * @param {string} modeName
   * @param {function(): boolean} isSupported Returns true if the JS engine
   *     supports the given mode.
   */
  function addNewerLanguageTranspilationCheck(modeName, isSupported) {
    if (transpilationRequiredForAllLaterModes) {
      requiresTranspilation[modeName] = true;
    } else if (isSupported()) {
      requiresTranspilation[modeName] = false;
    } else {
      requiresTranspilation[modeName] = true;
      transpilationRequiredForAllLaterModes = true;
    }
  }

  /**
   * Does the given code evaluate without syntax errors and return a truthy
   * result?
   */
  function /** boolean */ evalCheck(/** string */ code) {
    try {
      return !!eval(code);
    } catch (ignored) {
      return false;
    }
  }

  // Identify ES3-only browsers by their incorrect treatment of commas.
  addNewerLanguageTranspilationCheck('es5', function() {
    return evalCheck('[1,].length==1');
  });
  addNewerLanguageTranspilationCheck('es6', function() {
    // Test es6: [FF50 (?), Edge 14 (?), Chrome 50]
    //   (a) default params (specifically shadowing locals),
    //   (b) destructuring, (c) block-scoped functions,
    //   (d) for-of (const), (e) new.target/Reflect.construct
    var es6fullTest =
        'class X{constructor(){if(new.target!=String)throw 1;this.x=42}}' +
        'let q=Reflect.construct(X,[],String);if(q.x!=42||!(q instanceof ' +
        'String))throw 1;for(const a of[2,3]){if(a==2)continue;function ' +
        'f(z={a}){let a=0;return z.a}{function f(){return 0;}}return f()' +
        '==3}';

    return evalCheck('(()=>{"use strict";' + es6fullTest + '})()');
  });
  // TODO(joeltine): Remove es6-impl references for b/31340605.
  // Consider es6-impl (widely-implemented es6 features) to be supported
  // whenever es6 is supported. Technically es6-impl is a lower level of
  // support than es6, but we don't have tests specifically for it.
  addNewerLanguageTranspilationCheck('es6-impl', function() {
    return true;
  });
  // ** and **= are the only new features in 'es7'
  addNewerLanguageTranspilationCheck('es7', function() {
    return evalCheck('2 ** 2 == 4');
  });
  // async functions are the only new features in 'es8'
  addNewerLanguageTranspilationCheck('es8', function() {
    return evalCheck('async () => 1, true');
  });
  return requiresTranspilation;
};

// Input 1
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Attempt to ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = new Error().stack;
    if (stack) {
      this.stack = stack;
    }
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }

  /**
   * Whether to report this error to the server. Setting this to false will
   * cause the error reporter to not report the error back to the server,
   * which can be useful if the client knows that the error has already been
   * logged on the server.
   * @type {boolean}
   */
  this.reportErrorToServer = true;
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';

// Input 2
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of goog.dom.NodeType.
 */

goog.provide('goog.dom.NodeType');


/**
 * Constants for the nodeType attribute in the Node interface.
 *
 * These constants match those specified in the Node interface. These are
 * usually present on the Node object in recent browsers, but not in older
 * browsers (specifically, early IEs) and thus are given here.
 *
 * In some browsers (early IEs), these are not defined on the Node object,
 * so they are provided here.
 *
 * See http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};

// Input 3
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 * @author arv@google.com (Erik Arvidsson)
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * @define {boolean} Enables HTML escaping of lowercase letter "e" which helps
 * with detection of double-escaping as this letter is frequently used.
 */
goog.define('goog.string.DETECT_DOUBLE_ESCAPING', false);


/**
 * @define {boolean} Whether to force non-dom html unescaping.
 */
goog.define('goog.string.FORCE_NON_DOM_HTML_UNESCAPING', false);


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
             prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return (
      goog.string.caseInsensitiveCompare(
          suffix, str.substr(str.length - suffix.length, suffix.length)) == 0);
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s');  // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmptyOrWhitespace = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is empty.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty.
 */
goog.string.isEmptyString = function(str) {
  return str.length == 0;
};


/**
 * Checks if a string is empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespace.
 *
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 * @deprecated Use goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str))
 *     instead.
 */
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespaceSafe.
 *
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
      ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ')
      .replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim =
    (goog.TRUSTED_SITE && String.prototype.trim) ? function(str) {
      return str.trim();
    } : function(str) {
      // Since IE doesn't include non-breaking-space (0xa0) in their \s
      // character class (as required by section 7.2 of the ECMAScript spec),
      // we explicitly include it in the regexp to enforce consistent
      // cross-browser behavior.
      return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    };


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Compares two strings interpreting their numeric substrings as numbers.
 *
 * @param {string} str1 First string.
 * @param {string} str2 Second string.
 * @param {!RegExp} tokenizerRegExp Splits a string into substrings of
 *     non-negative integers, non-numeric characters and optionally fractional
 *     numbers starting with a decimal point.
 * @return {number} Negative if str1 < str2, 0 is str1 == str2, positive if
 *     str1 > str2.
 * @private
 */
goog.string.numberAwareCompare_ = function(str1, str2, tokenizerRegExp) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(tokenizerRegExp);
  var tokens2 = str2.toLowerCase().match(tokenizerRegExp);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {
      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII string
  // comparison to stabilize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * String comparison function that handles non-negative integer numbers in a
 * way humans might expect. Using this function, the string 'File 2.jpg' sorts
 * before 'File 10.jpg', and 'Version 1.9' before 'Version 1.10'. The comparison
 * is mostly case-insensitive, though strings that are identical except for case
 * are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is up to 50x slower than either the default or the
 * case-insensitive compare. It should not be used in time-critical code, but
 * should be fast enough to sort several hundred short strings (like filenames)
 * with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.intAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};


/**
 * String comparison function that handles non-negative integer and fractional
 * numbers in a way humans might expect. Using this function, the string
 * 'File 2.jpg' sorts before 'File 10.jpg', and '3.14' before '3.2'. Equivalent
 * to {@link goog.string.intAwareCompare} apart from the way how it interprets
 * dots.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.floatAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};


/**
 * Alias for {@link goog.string.floatAwareCompare}.
 *
 * @param {string} str1
 * @param {string} str2
 * @return {number}
 */
goog.string.numerateCompare = goog.string.floatAwareCompare;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escapes double quote '"' and single quote '\'' characters in addition to
 * '&', '<', and '>' so that a string can be included in an HTML tag attribute
 * value within double or single quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * With goog.string.DETECT_DOUBLE_ESCAPING, this function escapes also the
 * lowercase letter "e".
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, '&amp;')
              .replace(goog.string.LT_RE_, '&lt;')
              .replace(goog.string.GT_RE_, '&gt;')
              .replace(goog.string.QUOT_RE_, '&quot;')
              .replace(goog.string.SINGLE_QUOTE_RE_, '&#39;')
              .replace(goog.string.NULL_RE_, '&#0;');
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.ALL_RE_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.AMP_RE_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.LT_RE_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.GT_RE_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, '&quot;');
    }
    if (str.indexOf('\'') != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, '&#39;');
    }
    if (str.indexOf('\x00') != -1) {
      str = str.replace(goog.string.NULL_RE_, '&#0;');
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf('e') != -1) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.AMP_RE_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.LT_RE_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.GT_RE_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.QUOT_RE_ = /"/g;


/**
 * Regular expression that matches a single quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.SINGLE_QUOTE_RE_ = /'/g;


/**
 * Regular expression that matches null character, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.NULL_RE_ = /\x00/g;


/**
 * Regular expression that matches a lowercase letter "e", for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.E_RE_ = /e/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @const {!RegExp}
 * @private
 */
goog.string.ALL_RE_ =
    (goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/);


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one or we explicitly
    // requested non-DOM html unescaping.
    if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING &&
        'document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes a HTML string using the provided document.
 *
 * @param {string} str The string to unescape.
 * @param {!Document} document A document to use in escaping the string.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, '&')) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @param {Document=} opt_document An optional document to use for creating
 *     elements. If this is not specified then the default window.document
 *     will be used.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  /** @type {!Object<string, string>} */
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement('div');
  } else {
    div = goog.global.document.createElement('div');
  }
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  // This doesn't use goog.string.preserveSpaces for backwards compatibility.
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Preserve spaces that would be otherwise collapsed in HTML by replacing them
 * with non-breaking space Unicode characters.
 * @param {string} str The string in which to preserve whitespace.
 * @return {string} A copy of {@code str} with preserved whitespace.
 */
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, '$1' + goog.string.Unicode.NBSP);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(
    str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private {!Object<string, string>}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B',  // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\',
  // To support the use case of embedding quoted strings inside of script
  // tags, we have to make sure HTML comments and opening/closing script tags do
  // not appear in the resulting string. The specific strings that must be
  // escaped are documented at:
  // http://www.w3.org/TR/html51/semantics.html#restrictions-for-contents-of-script-elements
  '<': '\x3c'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private {!Object<string, string>}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string. The resulting string is safe to embed in
 * `<script>` tags as "<" is escaped.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  var sb = ['"'];
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    var cc = ch.charCodeAt(0);
    sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
        ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
  }
  sb.push('"');
  return sb.join('');
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) {  // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Determines whether a string contains a substring.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};


/**
 * Determines whether a string contains a substring, ignoring case.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 * Removes the first occurrence of a substring from a string.
 * @param {string} str The base string from which to remove.
 * @param {string} substr The string to remove.
 * @return {string} A copy of {@code str} with {@code substr} removed or the
 *     full string if nothing is removed.
 */
goog.string.remove = function(str, substr) {
  return str.replace(substr, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 *  Replaces all occurrences of a substring of a string with a new substring.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to replace.
 *  @param {string} replacement The replacement string.
 *  @return {string} A copy of {@code s} with {@code ss} replaced by
 *      {@code replacement} or the original string if nothing is replaced.
 */
goog.string.replaceAll = function(s, ss, replacement) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, replacement.replace(/\$/g, '$$$$'));
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s)
      .replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1')
      .replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = (String.prototype.repeat) ? function(string, length) {
  // The native method is over 100 times faster than the alternative.
  return string.repeat(length);
} : function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
      Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    do {
      // Split the subversions into pairs of numbers and qualifiers (like 'b').
      // Two different RegExp objects are use to make it clear the code
      // is side-effect free
      var v1Comp = /(\d*)(\D*)(.*)/.exec(v1Sub) || ['', '', '', ''];
      var v2Comp = /(\d*)(\D*)(.*)/.exec(v2Sub) || ['', '', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(
              v1Comp[2].length == 0, v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.

      v1Sub = v1Comp[3];
      v2Sub = v2Comp[3];
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    // Normalize to 4 byte range, 0 ... 2^32.
    result = (31 * result + str.charCodeAt(i)) >>> 0;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Infinity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(
      /\-([a-z])/g, function(all, match) { return match.toUpperCase(); });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) :
      '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(
      regexp, function(all, p1, p2) { return p1 + p2.toUpperCase(); });
};


/**
 * Capitalizes a string, i.e. converts the first letter to uppercase
 * and all other letters to lowercase, e.g.:
 *
 * goog.string.capitalize('one')     => 'One'
 * goog.string.capitalize('ONE')     => 'One'
 * goog.string.capitalize('one two') => 'One two'
 *
 * Note that this function does not trim initial whitespace.
 *
 * @param {string} str String value to capitalize.
 * @return {string} String value with first letter in uppercase.
 */
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() +
      String(str.substr(1)).toLowerCase();
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array<string>} The string, split.
 */
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};


/**
 * Finds the characters to the right of the last instance of any separator
 *
 * This function is similar to goog.string.path.baseName, except it can take a
 * list of characters to split the string on. It will return the rightmost
 * grouping of characters to the right of any separator as a left-to-right
 * oriented string.
 *
 * @see goog.string.path.baseName
 * @param {string} str The string
 * @param {string|!Array<string>} separators A list of separator characters
 * @return {string} The last part of the string with respect to the separators
 */
goog.string.lastComponent = function(str, separators) {
  if (!separators) {
    return str;
  } else if (typeof separators == 'string') {
    separators = [separators];
  }

  var lastSeparatorIndex = -1;
  for (var i = 0; i < separators.length; i++) {
    if (separators[i] == '') {
      continue;
    }
    var currentSeparatorIndex = str.lastIndexOf(separators[i]);
    if (currentSeparatorIndex > lastSeparatorIndex) {
      lastSeparatorIndex = currentSeparatorIndex;
    }
  }
  if (lastSeparatorIndex == -1) {
    return str;
  }
  return str.slice(lastSeparatorIndex + 1);
};


/**
 * Computes the Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @return {number} The edit distance between the two strings.
 */
goog.string.editDistance = function(a, b) {
  var v0 = [];
  var v1 = [];

  if (a == b) {
    return 0;
  }

  if (!a.length || !b.length) {
    return Math.max(a.length, b.length);
  }

  for (var i = 0; i < b.length + 1; i++) {
    v0[i] = i;
  }

  for (var i = 0; i < a.length; i++) {
    v1[0] = i + 1;

    for (var j = 0; j < b.length; j++) {
      var cost = Number(a[i] != b[j]);
      // Cost for the substring is the minimum of adding one character, removing
      // one character, or a swap.
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }

    for (var j = 0; j < v0.length; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[b.length];
};

// Input 4
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.dom.NodeType');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permanently modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * The default error handler.
 * @param {!goog.asserts.AssertionError} e The exception to be handled.
 */
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) {
  throw e;
};


/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!goog.asserts.AssertionError)}
 */
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ = function(
    defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  var e = new goog.asserts.AssertionError('' + message, args || []);
  goog.asserts.errorHandler_(e);
};


/**
 * Sets a custom error handler that can be used to customize the behavior of
 * assertion failures, for example by turning all assertion failures into log
 * messages.
 * @param {function(!goog.asserts.AssertionError)} errorHandler
 */
goog.asserts.setErrorHandler = function(errorHandler) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_ = errorHandler;
  }
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_(
        '', null, opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.asserts.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_(
        new goog.asserts.AssertionError(
            'Failure' + (opt_message ? ': ' + opt_message : ''),
            Array.prototype.slice.call(arguments, 1)));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_(
        'Expected number but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_(
        'Expected string but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_(
        'Expected function but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_(
        'Expected object but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array<?>} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_(
        'Expected array but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array<?>} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_(
        'Expected boolean but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not an Element.
 */
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS &&
      (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_(
        'Expected Element but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {?} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_(
        'Expected instanceof %s but got %s.',
        [goog.asserts.getType_(type), goog.asserts.getType_(value)],
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};


/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 * @private
 */
goog.asserts.getType_ = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return value.constructor.displayName || value.constructor.name ||
        Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
};

// Input 5
// Copyright 2015 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Wrapper for URL and its createObjectUrl and revokeObjectUrl
 * methods that are part of the HTML5 File API.
 */

goog.provide('goog.fs.url');


/**
 * Creates a blob URL for a blob object.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {!Blob} blob The object for which to create the URL.
 * @return {string} The URL for the object.
 */
goog.fs.url.createObjectUrl = function(blob) {
  return goog.fs.url.getUrlObject_().createObjectURL(blob);
};


/**
 * Revokes a URL created by {@link goog.fs.url.createObjectUrl}.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {string} url The URL to revoke.
 */
goog.fs.url.revokeObjectUrl = function(url) {
  goog.fs.url.getUrlObject_().revokeObjectURL(url);
};


/**
 * @typedef {{createObjectURL: (function(!Blob): string),
 *            revokeObjectURL: function(string): void}}
 */
goog.fs.url.UrlObject_;


/**
 * Get the object that has the createObjectURL and revokeObjectURL functions for
 * this browser.
 *
 * @return {goog.fs.url.UrlObject_} The object for this browser.
 * @private
 */
goog.fs.url.getUrlObject_ = function() {
  var urlObject = goog.fs.url.findUrlObject_();
  if (urlObject != null) {
    return urlObject;
  } else {
    throw Error('This browser doesn\'t seem to support blob URLs');
  }
};


/**
 * Finds the object that has the createObjectURL and revokeObjectURL functions
 * for this browser.
 *
 * @return {?goog.fs.url.UrlObject_} The object for this browser or null if the
 *     browser does not support Object Urls.
 * @private
 */
goog.fs.url.findUrlObject_ = function() {
  // This is what the spec says to do
  // http://dev.w3.org/2006/webapi/FileAPI/#dfn-createObjectURL
  if (goog.isDef(goog.global.URL) &&
      goog.isDef(goog.global.URL.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global.URL);
    // This is what Chrome does (as of 10.0.648.6 dev)
  } else if (
      goog.isDef(goog.global.webkitURL) &&
      goog.isDef(goog.global.webkitURL.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global.webkitURL);
    // This is what the spec used to say to do
  } else if (goog.isDef(goog.global.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global);
  } else {
    return null;
  }
};


/**
 * Checks whether this browser supports Object Urls. If not, calls to
 * createObjectUrl and revokeObjectUrl will result in an error.
 *
 * @return {boolean} True if this browser supports Object Urls.
 */
goog.fs.url.browserSupportsObjectUrls = function() {
  return goog.fs.url.findUrlObject_() != null;
};

// Input 6
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility functions for supporting Bidi issues.
 */


/**
 * Namespace for bidi supporting functions.
 */
goog.provide('goog.i18n.bidi');
goog.provide('goog.i18n.bidi.Dir');
goog.provide('goog.i18n.bidi.DirectionalString');
goog.provide('goog.i18n.bidi.Format');


/**
 * @define {boolean} FORCE_RTL forces the {@link goog.i18n.bidi.IS_RTL} constant
 * to say that the current locale is a RTL locale.  This should only be used
 * if you want to override the default behavior for deciding whether the
 * current locale is RTL or not.
 *
 * {@see goog.i18n.bidi.IS_RTL}
 */
goog.define('goog.i18n.bidi.FORCE_RTL', false);


/**
 * Constant that defines whether or not the current locale is a RTL locale.
 * If {@link goog.i18n.bidi.FORCE_RTL} is not true, this constant will default
 * to check that {@link goog.LOCALE} is one of a few major RTL locales.
 *
 * <p>This is designed to be a maximally efficient compile-time constant. For
 * example, for the default goog.LOCALE, compiling
 * "if (goog.i18n.bidi.IS_RTL) alert('rtl') else {}" should produce no code. It
 * is this design consideration that limits the implementation to only
 * supporting a few major RTL locales, as opposed to the broader repertoire of
 * something like goog.i18n.bidi.isRtlLanguage.
 *
 * <p>Since this constant refers to the directionality of the locale, it is up
 * to the caller to determine if this constant should also be used for the
 * direction of the UI.
 *
 * {@see goog.LOCALE}
 *
 * @type {boolean}
 *
 * TODO(user): write a test that checks that this is a compile-time constant.
 */
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL ||
    ((goog.LOCALE.substring(0, 2).toLowerCase() == 'ar' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'fa' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'he' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'iw' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'ps' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'sd' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'ug' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'ur' ||
      goog.LOCALE.substring(0, 2).toLowerCase() == 'yi') &&
     (goog.LOCALE.length == 2 || goog.LOCALE.substring(2, 3) == '-' ||
      goog.LOCALE.substring(2, 3) == '_')) ||
    (goog.LOCALE.length >= 3 &&
     goog.LOCALE.substring(0, 3).toLowerCase() == 'ckb' &&
     (goog.LOCALE.length == 3 || goog.LOCALE.substring(3, 4) == '-' ||
      goog.LOCALE.substring(3, 4) == '_'));


/**
 * Unicode formatting characters and directionality string constants.
 * @enum {string}
 */
goog.i18n.bidi.Format = {
  /** Unicode "Left-To-Right Embedding" (LRE) character. */
  LRE: '\u202A',
  /** Unicode "Right-To-Left Embedding" (RLE) character. */
  RLE: '\u202B',
  /** Unicode "Pop Directional Formatting" (PDF) character. */
  PDF: '\u202C',
  /** Unicode "Left-To-Right Mark" (LRM) character. */
  LRM: '\u200E',
  /** Unicode "Right-To-Left Mark" (RLM) character. */
  RLM: '\u200F'
};


/**
 * Directionality enum.
 * @enum {number}
 */
goog.i18n.bidi.Dir = {
  /**
   * Left-to-right.
   */
  LTR: 1,

  /**
   * Right-to-left.
   */
  RTL: -1,

  /**
   * Neither left-to-right nor right-to-left.
   */
  NEUTRAL: 0
};


/**
 * 'right' string constant.
 * @type {string}
 */
goog.i18n.bidi.RIGHT = 'right';


/**
 * 'left' string constant.
 * @type {string}
 */
goog.i18n.bidi.LEFT = 'left';


/**
 * 'left' if locale is RTL, 'right' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_RIGHT =
    goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;


/**
 * 'right' if locale is RTL, 'left' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_LEFT =
    goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;


/**
 * Convert a directionality given in various formats to a goog.i18n.bidi.Dir
 * constant. Useful for interaction with different standards of directionality
 * representation.
 *
 * @param {goog.i18n.bidi.Dir|number|boolean|null} givenDir Directionality given
 *     in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LTR, negative = RTL, 0 = neutral).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 * @param {boolean=} opt_noNeutral Whether a givenDir of zero or
 *     goog.i18n.bidi.Dir.NEUTRAL should be treated as null, i.e. unknown, in
 *     order to preserve legacy behavior.
 * @return {?goog.i18n.bidi.Dir} A goog.i18n.bidi.Dir constant matching the
 *     given directionality. If given null, returns null (i.e. unknown).
 */
goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
  if (typeof givenDir == 'number') {
    // This includes the non-null goog.i18n.bidi.Dir case.
    return givenDir > 0 ? goog.i18n.bidi.Dir.LTR : givenDir < 0 ?
                          goog.i18n.bidi.Dir.RTL :
                          opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL;
  } else if (givenDir == null) {
    return null;
  } else {
    // Must be typeof givenDir == 'boolean'.
    return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
  }
};


/**
 * A practical pattern to identify strong LTR characters. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.ltrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified
 * for performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.rtlChars_ =
    '\u0591-\u06EF\u06FA-\u07FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFC';


/**
 * Simplified regular expression for an HTML tag (opening or closing) or an HTML
 * escape. We might want to skip over such expressions when estimating the text
 * directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;


/**
 * Returns the input text with spaces instead of HTML tags or HTML escapes, if
 * opt_isStripNeeded is true. Else returns the input as is.
 * Useful for text directionality estimation.
 * Note: the function should not be used in other contexts; it is not 100%
 * correct, but rather a good-enough implementation for directionality
 * estimation purposes.
 * @param {string} str The given string.
 * @param {boolean=} opt_isStripNeeded Whether to perform the stripping.
 *     Default: false (to retain consistency with calling functions).
 * @return {string} The given string cleaned of HTML tags / escapes.
 * @private
 */
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, '') : str;
};


/**
 * Regular expression to check for RTL characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlCharReg_ = new RegExp('[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Regular expression to check for LTR characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrCharReg_ = new RegExp('[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains RTL characters.
 */
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlCharReg_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the string contains RTL characters.
 * @deprecated Use hasAnyRtl.
 */
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;


/**
 * Test whether the given string has any LTR characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains LTR characters.
 */
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrCharReg_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Regular expression pattern to check if the first character in the string
 * is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrRe_ = new RegExp('^[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expression pattern to check if the first character in the string
 * is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlRe_ = new RegExp('^[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check if the first character in the string is RTL or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an RTL char.
 */
goog.i18n.bidi.isRtlChar = function(str) {
  return goog.i18n.bidi.rtlRe_.test(str);
};


/**
 * Check if the first character in the string is LTR or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an LTR char.
 */
goog.i18n.bidi.isLtrChar = function(str) {
  return goog.i18n.bidi.ltrRe_.test(str);
};


/**
 * Check if the first character in the string is neutral or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is a neutral char.
 */
goog.i18n.bidi.isNeutralChar = function(str) {
  return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};


/**
 * Regular expressions to check if a piece of text is of LTR directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.rtlChars_ + ']*[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expressions to check if a piece of text is of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.ltrChars_ + ']*[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithRtl.
 */
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithLtr.
 */
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;


/**
 * Regular expression to check if a string looks like something that must
 * always be LTR even in RTL text, e.g. a URL. When estimating the
 * directionality of text containing these, we treat these as weakly LTR,
 * like numbers.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;


/**
 * Check whether the input string either contains no strongly directional
 * characters or looks like a url.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether neutral directionality is detected.
 */
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) ||
      !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.ltrChars_ + '][^' + goog.i18n.bidi.rtlChars_ + ']*$');


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.rtlChars_ + '][^' + goog.i18n.bidi.ltrChars_ + ']*$');


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 */
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 * @deprecated Use endsWithLtr.
 */
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 */
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 * @deprecated Use endsWithRtl.
 */
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;


/**
 * A regular expression for matching right-to-left language codes.
 * See {@link #isRtlLanguage} for the design.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlLocalesRe_ = new RegExp(
    '^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|' +
        '.*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))' +
        '(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)',
    'i');


/**
 * Check if a BCP 47 / III language code indicates an RTL language, i.e. either:
 * - a language code explicitly specifying one of the right-to-left scripts,
 *   e.g. "az-Arab", or<p>
 * - a language code specifying one of the languages normally written in a
 *   right-to-left script, e.g. "fa" (Farsi), except ones explicitly specifying
 *   Latin or Cyrillic script (which are the usual LTR alternatives).<p>
 * The list of right-to-left scripts appears in the 100-199 range in
 * http://www.unicode.org/iso15924/iso15924-num.html, of which Arabic and
 * Hebrew are by far the most widely used. We also recognize Thaana, N'Ko, and
 * Tifinagh, which also have significant modern usage. The rest (Syriac,
 * Samaritan, Mandaic, etc.) seem to have extremely limited or no modern usage
 * and are not recognized to save on code size.
 * The languages usually written in a right-to-left script are taken as those
 * with Suppress-Script: Hebr|Arab|Thaa|Nkoo|Tfng  in
 * http://www.iana.org/assignments/language-subtag-registry,
 * as well as Central (or Sorani) Kurdish (ckb), Sindhi (sd) and Uyghur (ug).
 * Other subtags of the language code, e.g. regions like EG (Egypt), are
 * ignored.
 * @param {string} lang BCP 47 (a.k.a III) language code.
 * @return {boolean} Whether the language code is an RTL language.
 */
goog.i18n.bidi.isRtlLanguage = function(lang) {
  return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};


/**
 * Regular expression for bracket guard replacement in text.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.bracketGuardTextRe_ =
    /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;


/**
 * Apply bracket guard using LRM and RLM. This is to address the problem of
 * messy bracket display frequently happens in RTL layout.
 * This function works for plain text, not for HTML. In HTML, the opening
 * bracket might be in a different context than the closing bracket (such as
 * an attribute value).
 * @param {string} s The string that need to be processed.
 * @param {boolean=} opt_isRtlContext specifies default direction (usually
 *     direction of the UI).
 * @return {string} The processed string, with all bracket guarded.
 */
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s) :
                                                opt_isRtlContext;
  var mark = useRtl ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + '$&' + mark);
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceRtlInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=rtl');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=rtl>' + html + '</span>';
};


/**
 * Enforce RTL on both end of the given text piece using unicode BiDi formatting
 * characters RLE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceRtlInText = function(text) {
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceLtrInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=ltr');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=ltr>' + html + '</span>';
};


/**
 * Enforce LTR on both end of the given text piece using unicode BiDi formatting
 * characters LRE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceLtrInText = function(text) {
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Regular expression to find dimensions such as "padding: .3 0.4ex 5px 6;"
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.dimensionsRe_ =
    /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;


/**
 * Regular expression for left.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.leftRe_ = /left/gi;


/**
 * Regular expression for right.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rightRe_ = /right/gi;


/**
 * Placeholder regular expression for swapping.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.tempRe_ = /%%%%/g;


/**
 * Swap location parameters and 'left'/'right' in CSS specification. The
 * processed string will be suited for RTL layout. Though this function can
 * cover most cases, there are always exceptions. It is suggested to put
 * those exceptions in separate group of CSS string.
 * @param {string} cssStr CSS spefication string.
 * @return {string} Processed CSS specification string.
 */
goog.i18n.bidi.mirrorCSS = function(cssStr) {
  return cssStr
      .
      // reverse dimensions
      replace(goog.i18n.bidi.dimensionsRe_, ':$1 $4 $3 $2')
      .replace(goog.i18n.bidi.leftRe_, '%%%%')
      .  // swap left and right
      replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT)
      .replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};


/**
 * Regular expression for hebrew double quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;


/**
 * Regular expression for hebrew single quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;


/**
 * Replace the double and single quote directly after a Hebrew character with
 * GERESH and GERSHAYIM. In such case, most likely that's user intention.
 * @param {string} str String that need to be processed.
 * @return {string} Processed string with double/single quote replaced.
 */
goog.i18n.bidi.normalizeHebrewQuote = function(str) {
  return str.replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, '$1\u05f4')
      .replace(goog.i18n.bidi.singleQuoteSubstituteRe_, '$1\u05f3');
};


/**
 * Regular expression to split a string into "words" for directionality
 * estimation based on relative word counts.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.wordSeparatorRe_ = /\s+/;


/**
 * Regular expression to check if a string contains any numerals. Used to
 * differentiate between completely neutral strings and those containing
 * numbers, which are weakly LTR.
 *
 * Native Arabic digits (\u0660 - \u0669) are not included because although they
 * do flow left-to-right inside a number, this is the case even if the  overall
 * directionality is RTL, and a mathematical expression using these digits is
 * supposed to flow right-to-left overall, including unary plus and minus
 * appearing to the right of a number, and this does depend on the overall
 * directionality being RTL. The digits used in Farsi (\u06F0 - \u06F9), on the
 * other hand, are included, since Farsi math (including unary plus and minus)
 * does flow left-to-right.
 *
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.hasNumeralsRe_ = /[\d\u06f0-\u06f9]/;


/**
 * This constant controls threshold of RTL directionality.
 * @type {number}
 * @private
 */
goog.i18n.bidi.rtlDetectionThreshold_ = 0.40;


/**
 * Estimates the directionality of a string based on relative word counts.
 * If the number of RTL words is above a certain percentage of the total number
 * of strongly directional words, returns RTL.
 * Otherwise, if any words are strongly or weakly LTR, returns LTR.
 * Otherwise, returns UNKNOWN, which is used to mean "neutral".
 * Numbers are counted as weakly LTR.
 * @param {string} str The string to be checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {goog.i18n.bidi.Dir} Estimated overall directionality of {@code str}.
 */
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
  var rtlCount = 0;
  var totalCount = 0;
  var hasWeaklyLtr = false;
  var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)
                   .split(goog.i18n.bidi.wordSeparatorRe_);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (goog.i18n.bidi.startsWithRtl(token)) {
      rtlCount++;
      totalCount++;
    } else if (goog.i18n.bidi.isRequiredLtrRe_.test(token)) {
      hasWeaklyLtr = true;
    } else if (goog.i18n.bidi.hasAnyLtr(token)) {
      totalCount++;
    } else if (goog.i18n.bidi.hasNumeralsRe_.test(token)) {
      hasWeaklyLtr = true;
    }
  }

  return totalCount == 0 ?
      (hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL) :
      (rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ?
           goog.i18n.bidi.Dir.RTL :
           goog.i18n.bidi.Dir.LTR);
};


/**
 * Check the directionality of a piece of text, return true if the piece of
 * text should be laid out in RTL direction.
 * @param {string} str The piece of text that need to be detected.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether this piece of text should be laid out in RTL.
 */
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) ==
      goog.i18n.bidi.Dir.RTL;
};


/**
 * Sets text input element's directionality and text alignment based on a
 * given directionality. Does nothing if the given directionality is unknown or
 * neutral.
 * @param {Element} element Input field element to set directionality to.
 * @param {goog.i18n.bidi.Dir|number|boolean|null} dir Desired directionality,
 *     given in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LRT, negative = RTL, 0 = neutral).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 */
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
  if (element) {
    dir = goog.i18n.bidi.toDir(dir);
    if (dir) {
      element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ?
          goog.i18n.bidi.RIGHT :
          goog.i18n.bidi.LEFT;
      element.dir = dir == goog.i18n.bidi.Dir.RTL ? 'rtl' : 'ltr';
    }
  }
};


/**
 * Sets element dir based on estimated directionality of the given text.
 * @param {!Element} element
 * @param {string} text
 */
goog.i18n.bidi.setElementDirByTextDirectionality = function(element, text) {
  switch (goog.i18n.bidi.estimateDirection(text)) {
    case (goog.i18n.bidi.Dir.LTR):
      element.dir = 'ltr';
      break;
    case (goog.i18n.bidi.Dir.RTL):
      element.dir = 'rtl';
      break;
    default:
      // Default for no direction, inherit from document.
      element.removeAttribute('dir');
  }
};



/**
 * Strings that have an (optional) known direction.
 *
 * Implementations of this interface are string-like objects that carry an
 * attached direction, if known.
 * @interface
 */
goog.i18n.bidi.DirectionalString = function() {};


/**
 * Interface marker of the DirectionalString interface.
 *
 * This property can be used to determine at runtime whether or not an object
 * implements this interface.  All implementations of this interface set this
 * property to {@code true}.
 * @type {boolean}
 */
goog.i18n.bidi.DirectionalString.prototype
    .implementsGoogI18nBidiDirectionalString;


/**
 * Retrieves this object's known direction (if any).
 * @return {?goog.i18n.bidi.Dir} The known direction. Null if unknown.
 */
goog.i18n.bidi.DirectionalString.prototype.getDirection;

// Input 7
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.string.TypedString');



/**
 * Wrapper for strings that conform to a data type or language.
 *
 * Implementations of this interface are wrappers for strings, and typically
 * associate a type contract with the wrapped string.  Concrete implementations
 * of this interface may choose to implement additional run-time type checking,
 * see for example {@code goog.html.SafeHtml}. If available, client code that
 * needs to ensure type membership of an object should use the type's function
 * to assert type membership, such as {@code goog.html.SafeHtml.unwrap}.
 * @interface
 */
goog.string.TypedString = function() {};


/**
 * Interface marker of the TypedString interface.
 *
 * This property can be used to determine at runtime whether or not an object
 * implements this interface.  All implementations of this interface set this
 * property to {@code true}.
 * @type {boolean}
 */
goog.string.TypedString.prototype.implementsGoogStringTypedString;


/**
 * Retrieves this wrapped string's value.
 * @return {string} The wrapped string's value.
 */
goog.string.TypedString.prototype.getTypedStringValue;

// Input 8
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.string.Const');

goog.require('goog.asserts');
goog.require('goog.string.TypedString');



/**
 * Wrapper for compile-time-constant strings.
 *
 * Const is a wrapper for strings that can only be created from program
 * constants (i.e., string literals).  This property relies on a custom Closure
 * compiler check that {@code goog.string.Const.from} is only invoked on
 * compile-time-constant expressions.
 *
 * Const is useful in APIs whose correct and secure use requires that certain
 * arguments are not attacker controlled: Compile-time constants are inherently
 * under the control of the application and not under control of external
 * attackers, and hence are safe to use in such contexts.
 *
 * Instances of this type must be created via its factory method
 * {@code goog.string.Const.from} and not by invoking its constructor.  The
 * constructor intentionally takes no parameters and the type is immutable;
 * hence only a default instance corresponding to the empty string can be
 * obtained via constructor invocation.
 *
 * @see goog.string.Const#from
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.string.Const = function() {
  /**
   * The wrapped value of this Const object.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.string.Const#unwrap
   * @const {!Object}
   * @private
   */
  this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ =
      goog.string.Const.TYPE_MARKER_;
};


/**
 * @override
 * @const
 */
goog.string.Const.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this Const's value a string.
 *
 * IMPORTANT: In code where it is security-relevant that an object's type is
 * indeed {@code goog.string.Const}, use {@code goog.string.Const.unwrap}
 * instead of this method.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.getTypedStringValue = function() {
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};


/**
 * Returns a debug-string representation of this value.
 *
 * To obtain the actual string value wrapped inside an object of this type,
 * use {@code goog.string.Const.unwrap}.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.toString = function() {
  return 'Const{' +
      this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ +
      '}';
};


/**
 * Performs a runtime check that the provided object is indeed an instance
 * of {@code goog.string.Const}, and returns its value.
 * @param {!goog.string.Const} stringConst The object to extract from.
 * @return {string} The Const object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.string.Const.unwrap = function(stringConst) {
  // Perform additional run-time type-checking to ensure that stringConst is
  // indeed an instance of the expected type.  This provides some additional
  // protection against security bugs due to application code that disables type
  // checks.
  if (stringConst instanceof goog.string.Const &&
      stringConst.constructor === goog.string.Const &&
      stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ ===
          goog.string.Const.TYPE_MARKER_) {
    return stringConst
        .stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  } else {
    goog.asserts.fail(
        'expected object of type Const, got \'' + stringConst + '\'');
    return 'type_error:Const';
  }
};


/**
 * Creates a Const object from a compile-time constant string.
 *
 * It is illegal to invoke this function on an expression whose
 * compile-time-contant value cannot be determined by the Closure compiler.
 *
 * Correct invocations include,
 * <pre>
 *   var s = goog.string.Const.from('hello');
 *   var t = goog.string.Const.from('hello' + 'world');
 * </pre>
 *
 * In contrast, the following are illegal:
 * <pre>
 *   var s = goog.string.Const.from(getHello());
 *   var t = goog.string.Const.from('hello' + world);
 * </pre>
 *
 * @param {string} s A constant string from which to create a Const.
 * @return {!goog.string.Const} A Const object initialized to stringConst.
 */
goog.string.Const.from = function(s) {
  return goog.string.Const.create__googStringSecurityPrivate_(s);
};


/**
 * Type marker for the Const type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.string.Const.TYPE_MARKER_ = {};


/**
 * Utility method to create Const instances.
 * @param {string} s The string to initialize the Const object with.
 * @return {!goog.string.Const} The initialized Const object.
 * @private
 */
goog.string.Const.create__googStringSecurityPrivate_ = function(s) {
  var stringConst = new goog.string.Const();
  stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_ =
      s;
  return stringConst;
};


/**
 * A Const instance wrapping the empty string.
 * @const {!goog.string.Const}
 */
goog.string.Const.EMPTY = goog.string.Const.from('');

// Input 9
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The TrustedResourceUrl type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.TrustedResourceUrl');

goog.require('goog.asserts');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A URL which is under application control and from which script, CSS, and
 * other resources that represent executable code, can be fetched.
 *
 * Given that the URL can only be constructed from strings under application
 * control and is used to load resources, bugs resulting in a malformed URL
 * should not have a security impact and are likely to be easily detectable
 * during testing. Given the wide number of non-RFC compliant URLs in use,
 * stricter validation could prevent some applications from being able to use
 * this type.
 *
 * Instances of this type must be created via the factory method,
 * ({@code goog.html.TrustedResourceUrl.fromConstant}), and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty
 * string can be obtained via constructor invocation.
 *
 * @see goog.html.TrustedResourceUrl#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.TrustedResourceUrl = function() {
  /**
   * The contained value of this TrustedResourceUrl.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.TrustedResourceUrl#unwrap
   * @const {!Object}
   * @private
   */
  this.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.TrustedResourceUrl.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this TrustedResourceUrl's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code TrustedResourceUrl}, use
 * {@code goog.html.TrustedResourceUrl.unwrap} instead of this method. If in
 * doubt, assume that it's security relevant. In particular, note that
 * goog.html functions which return a goog.html type do not guarantee that
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml instanceof
 * // goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.TrustedResourceUrl#unwrap
 * @override
 */
goog.html.TrustedResourceUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
};


/**
 * @override
 * @const
 */
goog.html.TrustedResourceUrl.prototype.implementsGoogI18nBidiDirectionalString =
    true;


/**
 * Returns this URLs directionality, which is always {@code LTR}.
 * @override
 */
goog.html.TrustedResourceUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a TrustedResourceUrl, use
   * {@code goog.html.TrustedResourceUrl.unwrap}.
   *
   * @see goog.html.TrustedResourceUrl#unwrap
   * @override
   */
  goog.html.TrustedResourceUrl.prototype.toString = function() {
    return 'TrustedResourceUrl{' +
        this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * TrustedResourceUrl object, and returns its value.
 *
 * @param {!goog.html.TrustedResourceUrl} trustedResourceUrl The object to
 *     extract from.
 * @return {string} The trustedResourceUrl object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.TrustedResourceUrl.unwrap = function(trustedResourceUrl) {
  // Perform additional Run-time type-checking to ensure that
  // trustedResourceUrl is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (trustedResourceUrl instanceof goog.html.TrustedResourceUrl &&
      trustedResourceUrl.constructor === goog.html.TrustedResourceUrl &&
      trustedResourceUrl
              .TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.TrustedResourceUrl
              .TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return trustedResourceUrl
        .privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type TrustedResourceUrl, got \'' +
        trustedResourceUrl + '\' of type ' + goog.typeOf(trustedResourceUrl));
    return 'type_error:TrustedResourceUrl';
  }
};


/**
 * Creates a TrustedResourceUrl from a format string and arguments.
 *
 * The arguments for interpolation into the format string map labels to values.
 * Values of type `goog.string.Const` are interpolated without modifcation.
 * Values of other types are cast to string and encoded with
 * encodeURIComponent.
 *
 * `%{<label>}` markers are used in the format string to indicate locations
 * to be interpolated with the valued mapped to the given label. `<label>`
 * must contain only alphanumeric and `_` characters.
 *
 * The format string must start with one of the following:
 * - `https://<origin>/`
 * - `//<origin>/`
 * - `/<pathStart>`
 *
 * `<origin>` must contain only alphanumeric or any of the following: `-.:[]`.
 * `<pathStart>` is any character except `/` and `\`.
 *
 * Example usage:
 *
 *    var url = goog.html.TrustedResourceUrl.format(goog.string.Const.from(
 *        'https://www.google.com/search?q=%{query}), {query: searchTerm});
 *
 *    var url = goog.html.TrustedResourceUrl.format(goog.string.Const.from(
 *        '//www.youtube.com/v/%{videoId}?hl=en&fs=1%{autoplay}'), {
 *        'videoId': videoId,
 *        'autoplay': opt_autoplay ?
 *            goog.string.Const.EMPTY : goog.string.Const.from('autoplay=1')
 *    });
 *
 * While this function can be used to create a TrustedResourceUrl from only
 * constants, fromConstant() and fromConstants() are generally preferable for
 * that purpose.
 *
 * @param {!goog.string.Const} format The format string.
 * @param {!Object<string, (string|number|!goog.string.Const)>} args Mapping
 *     of labels to values to be interpolated into the format string.
 *     goog.string.Const values are interpolated without encoding.
 * @return {!goog.html.TrustedResourceUrl}
 * @throws {!Error} On an invalid format string or if a label used in the
 *     the format string is not present in args.
 *
 */
goog.html.TrustedResourceUrl.format = function(format, args) {
  var formatStr = goog.string.Const.unwrap(format);
  if (!goog.html.TrustedResourceUrl.BASE_URL_.test(formatStr)) {
    throw new Error('Invalid TrustedResourceUrl format: ' + formatStr);
  }
  var result = formatStr.replace(
      goog.html.TrustedResourceUrl.FORMAT_MARKER_, function(match, id) {
        if (!Object.prototype.hasOwnProperty.call(args, id)) {
          throw new Error(
              'Found marker, "' + id + '", in format string, "' + formatStr +
              '", but no valid label mapping found ' +
              'in args: ' + JSON.stringify(args));
        }
        var arg = args[id];
        if (arg instanceof goog.string.Const) {
          return goog.string.Const.unwrap(arg);
        } else {
          return encodeURIComponent(String(arg));
        }
      });
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(result);
};


/**
 * @private @const {!RegExp}
 */
goog.html.TrustedResourceUrl.FORMAT_MARKER_ = /%{(\w+)}/g;


/**
 * The URL must be absolute, scheme-relative or path-absolute. So it must
 * start with:
 * - https:// followed by allowed origin characters.
 * - // followed by allowed origin characters.
 * - / not followed by / or \. There will only be an absolute path.
 *
 * Based on
 * https://url.spec.whatwg.org/commit-snapshots/56b74ce7cca8883eab62e9a12666e2fac665d03d/#url-parsing
 * an initial / which is not followed by another / or \ will end up in the "path
 * state" and from there it can only go to "fragment state" and "query state".
 *
 * We don't enforce a well-formed domain name. So '.' or '1.2' are valid.
 * That's ok because the origin comes from a compile-time constant.
 *
 * A regular expression is used instead of goog.uri for several reasons:
 * - Strictness. E.g. we don't want any userinfo component and we don't
 *   want '/./, nor \' in the first path component.
 * - Small trusted base. goog.uri is generic and might need to change,
 *   reasoning about all the ways it can parse a URL now and in the future
 *   is error-prone.
 * - Code size. We expect many calls to .format(), many of which might
 *   not be using goog.uri.
 * - Simplicity. Using goog.uri would likely not result in simpler nor shorter
 *   code.
 * @private @const {!RegExp}
 */
goog.html.TrustedResourceUrl.BASE_URL_ =
    /^(?:https:)?\/\/[0-9a-z.:[\]-]+\/|^\/[^\/\\]/i;


/**
 * Creates a TrustedResourceUrl object from a compile-time constant string.
 *
 * Compile-time constant strings are inherently program-controlled and hence
 * trusted.
 *
 * @param {!goog.string.Const} url A compile-time-constant string from which to
 *     create a TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} A TrustedResourceUrl object
 *     initialized to {@code url}.
 */
goog.html.TrustedResourceUrl.fromConstant = function(url) {
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(
          goog.string.Const.unwrap(url));
};


/**
 * Creates a TrustedResourceUrl object from a compile-time constant strings.
 *
 * Compile-time constant strings are inherently program-controlled and hence
 * trusted.
 *
 * @param {!Array<!goog.string.Const>} parts Compile-time-constant strings from
 *     which to create a TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} A TrustedResourceUrl object
 *     initialized to concatenation of {@code parts}.
 */
goog.html.TrustedResourceUrl.fromConstants = function(parts) {
  var unwrapped = '';
  for (var i = 0; i < parts.length; i++) {
    unwrapped += goog.string.Const.unwrap(parts[i]);
  }
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(unwrapped);
};


/**
 * Type marker for the TrustedResourceUrl type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create TrustedResourceUrl instances.
 *
 * @param {string} url The string to initialize the TrustedResourceUrl object
 *     with.
 * @return {!goog.html.TrustedResourceUrl} The initialized TrustedResourceUrl
 *     object.
 * @package
 */
goog.html.TrustedResourceUrl
    .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var trustedResourceUrl = new goog.html.TrustedResourceUrl();
  trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ =
      url;
  return trustedResourceUrl;
};

// Input 10
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The SafeUrl type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeUrl');

goog.require('goog.asserts');
goog.require('goog.fs.url');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string that is safe to use in URL context in DOM APIs and HTML documents.
 *
 * A SafeUrl is a string-like object that carries the security type contract
 * that its value as a string will not cause untrusted script execution
 * when evaluated as a hyperlink URL in a browser.
 *
 * Values of this type are guaranteed to be safe to use in URL/hyperlink
 * contexts, such as, assignment to URL-valued DOM properties, or
 * interpolation into a HTML template in URL context (e.g., inside a href
 * attribute), in the sense that the use will not result in a
 * Cross-Site-Scripting vulnerability.
 *
 * Note that, as documented in {@code goog.html.SafeUrl.unwrap}, this type's
 * contract does not guarantee that instances are safe to interpolate into HTML
 * without appropriate escaping.
 *
 * Note also that this type's contract does not imply any guarantees regarding
 * the resource the URL refers to.  In particular, SafeUrls are <b>not</b>
 * safe to use in a context where the referred-to resource is interpreted as
 * trusted code, e.g., as the src of a script tag.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeUrl.fromConstant}, {@code goog.html.SafeUrl.sanitize}),
 * etc and not by invoking its constructor.  The constructor intentionally
 * takes no parameters and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * @see goog.html.SafeUrl#fromConstant
 * @see goog.html.SafeUrl#from
 * @see goog.html.SafeUrl#sanitize
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeUrl = function() {
  /**
   * The contained value of this SafeUrl.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeUrl#unwrap
   * @const {!Object}
   * @private
   */
  this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * The innocuous string generated by goog.html.SafeUrl.sanitize when passed
 * an unsafe URL.
 *
 * about:invalid is registered in
 * http://www.w3.org/TR/css3-values/#about-invalid.
 * http://tools.ietf.org/html/rfc6694#section-2.2.1 permits about URLs to
 * contain a fragment, which is not to be considered when determining if an
 * about URL is well-known.
 *
 * Using about:invalid seems preferable to using a fixed data URL, since
 * browsers might choose to not report CSP violations on it, as legitimate
 * CSS function calls to attr() can result in this URL being produced. It is
 * also a standard URL which matches exactly the semantics we need:
 * "The about:invalid URI references a non-existent document with a generic
 * error condition. It can be used when a URI is necessary, but the default
 * value shouldn't be resolveable as any type of document".
 *
 * @const {string}
 */
goog.html.SafeUrl.INNOCUOUS_STRING = 'about:invalid#zClosurez';


/**
 * @override
 * @const
 */
goog.html.SafeUrl.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this SafeUrl's value a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeUrl}, use {@code goog.html.SafeUrl.unwrap} instead of this
 * method. If in doubt, assume that it's security relevant. In particular, note
 * that goog.html functions which return a goog.html type do not guarantee that
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml instanceof
 * // goog.html.SafeHtml.
 * </pre>
 *
 * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
 * behavior of browsers when interpreting URLs. Values of SafeUrl objects MUST
 * be appropriately escaped before embedding in a HTML document. Note that the
 * required escaping is context-sensitive (e.g. a different escaping is
 * required for embedding a URL in a style property within a style
 * attribute, as opposed to embedding in a href attribute).
 *
 * @see goog.html.SafeUrl#unwrap
 * @override
 */
goog.html.SafeUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};


/**
 * @override
 * @const
 */
goog.html.SafeUrl.prototype.implementsGoogI18nBidiDirectionalString = true;


/**
 * Returns this URLs directionality, which is always {@code LTR}.
 * @override
 */
goog.html.SafeUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeUrl, use
   * {@code goog.html.SafeUrl.unwrap}.
   *
   * @see goog.html.SafeUrl#unwrap
   * @override
   */
  goog.html.SafeUrl.prototype.toString = function() {
    return 'SafeUrl{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a SafeUrl
 * object, and returns its value.
 *
 * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
 * behavior of  browsers when interpreting URLs. Values of SafeUrl objects MUST
 * be appropriately escaped before embedding in a HTML document. Note that the
 * required escaping is context-sensitive (e.g. a different escaping is
 * required for embedding a URL in a style property within a style
 * attribute, as opposed to embedding in a href attribute).
 *
 * @param {!goog.html.SafeUrl} safeUrl The object to extract from.
 * @return {string} The SafeUrl object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeUrl.unwrap = function(safeUrl) {
  // Perform additional Run-time type-checking to ensure that safeUrl is indeed
  // an instance of the expected type.  This provides some additional protection
  // against security bugs due to application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeUrl instanceof goog.html.SafeUrl &&
      safeUrl.constructor === goog.html.SafeUrl &&
      safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeUrl, got \'' +
        safeUrl + '\' of type ' + goog.typeOf(safeUrl));
    return 'type_error:SafeUrl';
  }
};


/**
 * Creates a SafeUrl object from a compile-time constant string.
 *
 * Compile-time constant strings are inherently program-controlled and hence
 * trusted.
 *
 * @param {!goog.string.Const} url A compile-time-constant string from which to
 *         create a SafeUrl.
 * @return {!goog.html.SafeUrl} A SafeUrl object initialized to {@code url}.
 */
goog.html.SafeUrl.fromConstant = function(url) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      goog.string.Const.unwrap(url));
};


/**
 * A pattern that matches Blob or data types that can have SafeUrls created
 * from URL.createObjectURL(blob) or via a data: URI.  Only matches image and
 * video types, currently.
 * @const
 * @private
 */
goog.html.SAFE_MIME_TYPE_PATTERN_ =
    /^(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm))$/i;


/**
 * Creates a SafeUrl wrapping a blob URL for the given {@code blob}.
 *
 * The blob URL is created with {@code URL.createObjectURL}. If the MIME type
 * for {@code blob} is not of a known safe image or video MIME type, then the
 * SafeUrl will wrap {@link #INNOCUOUS_STRING}.
 *
 * @see http://www.w3.org/TR/FileAPI/#url
 * @param {!Blob} blob
 * @return {!goog.html.SafeUrl} The blob URL, or an innocuous string wrapped
 *   as a SafeUrl.
 */
goog.html.SafeUrl.fromBlob = function(blob) {
  var url = goog.html.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ?
      goog.fs.url.createObjectUrl(blob) :
      goog.html.SafeUrl.INNOCUOUS_STRING;
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Matches a base-64 data URL, with the first match group being the MIME type.
 * @const
 * @private
 */
goog.html.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;


/**
 * Creates a SafeUrl wrapping a data: URL, after validating it matches a
 * known-safe image or video MIME type.
 *
 * @param {string} dataUrl A valid base64 data URL with one of the whitelisted
 *     image or video MIME types.
 * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
 *     wrapped as a SafeUrl if it does not pass.
 */
goog.html.SafeUrl.fromDataUrl = function(dataUrl) {
  // There's a slight risk here that a browser sniffs the content type if it
  // doesn't know the MIME type and executes HTML within the data: URL. For this
  // to cause XSS it would also have to execute the HTML in the same origin
  // of the page with the link. It seems unlikely that both of these will
  // happen, particularly in not really old IEs.
  var match = dataUrl.match(goog.html.DATA_URL_PATTERN_);
  var valid = match && goog.html.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      valid ? dataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
};


/**
 * Creates a SafeUrl wrapping a tel: URL.
 *
 * @param {string} telUrl A tel URL.
 * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
 *     wrapped as a SafeUrl if it does not pass.
 */
goog.html.SafeUrl.fromTelUrl = function(telUrl) {
  // There's a risk that a tel: URL could immediately place a call once
  // clicked, without requiring user confirmation. For that reason it is
  // handled in this separate function.
  if (!goog.string.caseInsensitiveStartsWith(telUrl, 'tel:')) {
    telUrl = goog.html.SafeUrl.INNOCUOUS_STRING;
  }
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      telUrl);
};


/**
 * Creates a SafeUrl from TrustedResourceUrl. This is safe because
 * TrustedResourceUrl is more tightly restricted than SafeUrl.
 *
 * @param {!goog.html.TrustedResourceUrl} trustedResourceUrl
 * @return {!goog.html.SafeUrl}
 */
goog.html.SafeUrl.fromTrustedResourceUrl = function(trustedResourceUrl) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl));
};


/**
 * A pattern that recognizes a commonly useful subset of URLs that satisfy
 * the SafeUrl contract.
 *
 * This regular expression matches a subset of URLs that will not cause script
 * execution if used in URL context within a HTML document. Specifically, this
 * regular expression matches if (comment from here on and regex copied from
 * Soy's EscapingConventions):
 * (1) Either a protocol in a whitelist (http, https, mailto or ftp).
 * (2) or no protocol.  A protocol must be followed by a colon. The below
 *     allows that by allowing colons only after one of the characters [/?#].
 *     A colon after a hash (#) must be in the fragment.
 *     Otherwise, a colon after a (?) must be in a query.
 *     Otherwise, a colon after a single solidus (/) must be in a path.
 *     Otherwise, a colon after a double solidus (//) must be in the authority
 *     (before port).
 *
 * The pattern disallows &, used in HTML entity declarations before
 * one of the characters in [/?#]. This disallows HTML entities used in the
 * protocol name, which should never happen, e.g. "h&#116;tp" for "http".
 * It also disallows HTML entities in the first path part of a relative path,
 * e.g. "foo&lt;bar/baz".  Our existing escaping functions should not produce
 * that. More importantly, it disallows masking of a colon,
 * e.g. "javascript&#58;...".
 *
 * @private
 * @const {!RegExp}
 */
goog.html.SAFE_URL_PATTERN_ =
    /^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i;


/**
 * Creates a SafeUrl object from {@code url}. If {@code url} is a
 * goog.html.SafeUrl then it is simply returned. Otherwise the input string is
 * validated to match a pattern of commonly used safe URLs.
 *
 * {@code url} may be a URL with the http, https, mailto or ftp scheme,
 * or a relative URL (i.e., a URL without a scheme; specifically, a
 * scheme-relative, absolute-path-relative, or path-relative URL).
 *
 * @see http://url.spec.whatwg.org/#concept-relative-url
 * @param {string|!goog.string.TypedString} url The URL to validate.
 * @return {!goog.html.SafeUrl} The validated URL, wrapped as a SafeUrl.
 */
goog.html.SafeUrl.sanitize = function(url) {
  if (url instanceof goog.html.SafeUrl) {
    return url;
  } else if (url.implementsGoogStringTypedString) {
    url = url.getTypedStringValue();
  } else {
    url = String(url);
  }
  if (!goog.html.SAFE_URL_PATTERN_.test(url)) {
    url = goog.html.SafeUrl.INNOCUOUS_STRING;
  }
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Type marker for the SafeUrl type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create SafeUrl instances.
 *
 * @param {string} url The string to initialize the SafeUrl object with.
 * @return {!goog.html.SafeUrl} The initialized SafeUrl object.
 * @package
 */
goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse = function(
    url) {
  var safeUrl = new goog.html.SafeUrl();
  safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = url;
  return safeUrl;
};


/**
 * A SafeUrl corresponding to the special about:blank url.
 * @const {!goog.html.SafeUrl}
 */
goog.html.SafeUrl.ABOUT_BLANK =
    goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
        'about:blank');

