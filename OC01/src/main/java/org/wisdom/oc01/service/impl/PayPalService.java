package org.wisdom.oc01.service.impl;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final APIContext apiContext;

    public String createPayment(String orderId, String amount, String description,
                                String cancelUrl, String successUrl) throws PayPalRESTException {
        BigDecimal amountUSD = new BigDecimal(amount).divide(new BigDecimal("24000"), 2, RoundingMode.UP);

        Amount paypalAmount = new Amount();
        paypalAmount.setCurrency("USD");
        paypalAmount.setTotal(amountUSD.toString());

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(paypalAmount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);

        String approvalUrl = createdPayment.getLinks().stream()
                .filter(link -> "approval_url".equals(link.getRel()))
                .findFirst()
                .map(Links::getHref)
                .orElse(null);

        return approvalUrl;
    }

    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution paymentExecute = new PaymentExecution();
        paymentExecute.setPayerId(payerId);

        return payment.execute(apiContext, paymentExecute);
    }
}