/**
 * @template T
 * @typedef {Promise<T> & { resolver: function(T): void, rejecter: function(Error): void}} PromiseWithExposedResolver<T>
 */

/**
 * @template T
 * @returns {PromiseWithExposedResolver<T>}
 */
function CreatePendingPromise() {
    let resolver = null
    let rejecter = null

    const promise = new Promise((resolve, reject) => {
        resolver = resolve
        rejecter = reject
    })
    promise.rejecter = rejecter
    promise.resolver = resolver
    return promise
}

module.exports = CreatePendingPromise